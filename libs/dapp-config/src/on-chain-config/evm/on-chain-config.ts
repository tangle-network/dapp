import { Provider } from '@ethersproject/abstract-provider';
import { retryPromise } from '@webb-tools/browser-utils';
import {
  ERC20__factory,
  FungibleTokenWrapper__factory,
  VAnchor__factory,
} from '@webb-tools/contracts';
import {
  CurrencyRole,
  CurrencyType,
  EVMChainId,
  zeroAddress,
} from '@webb-tools/dapp-types';
import { ChainType, parseTypedChainId } from '@webb-tools/sdk-core';
import assert from 'assert';

import { ChainAddressConfig } from '../../anchors';
import { CurrencyConfig } from '../../currencies';
import { ICurrency, OnChainConfigBase } from '../on-chain-config-base';

// The chain info is retrieved from https://github.com/ethereum-lists/chains
const CHAIN_URL = 'https://chainid.network/chains.json';

// the singleton instance of the EVM on-chain config with lazy initialization
let EVMOnChainConfigInstance: EVMOnChainConfig;

const LOCALNET_CHAIN_IDS = [
  EVMChainId.HermesLocalnet,
  EVMChainId.AthenaLocalnet,
  EVMChainId.DemeterLocalnet,
];

const LOCALNET_CURRENCY: ICurrency = {
  name: 'Localnet Ether',
  symbol: 'ETH',
  decimals: 18,
  address: zeroAddress,
};

type EVMCurrencyResponse = {
  typedChainId: number;
  nativeCurrency: ICurrency;
  anchorAddress: string;
  fungibleCurrency: ICurrency;
  wrappableCurrencies: ICurrency[];
};

// Cache the chain data
let chainData: Array<{
  // The native currencies response doesn't include the address
  nativeCurrency: Omit<ICurrency, 'address'>;
  chainId: number;
}> = [];

// Cache the currencies config
let cachedCurrenciesConfig: {
  currenciesConfig: Record<number, CurrencyConfig>;
  fungibleToWrappableMap: Map<number, Map<number, Set<number>>>;
  anchorConfig: Record<number, ChainAddressConfig>;
};

export class EVMOnChainConfig extends OnChainConfigBase {
  private constructor() {
    super();
  }

  static getInstance() {
    if (!EVMOnChainConfigInstance) {
      EVMOnChainConfigInstance = new EVMOnChainConfig();
    }
    return EVMOnChainConfigInstance;
  }

  async fetchNativeCurrency(typedChainId: number): Promise<ICurrency | null> {
    // First check if the native currency is already cached
    const cachedNativeCurrency = this.nativeCurrencyCache.get(typedChainId);
    if (cachedNativeCurrency) {
      return Promise.resolve(cachedNativeCurrency);
    }

    // Validate the chainType is EVM and get the chaindId
    const { chainId } = this.validateChainType(typedChainId);

    // Maybe evn localnet
    if (LOCALNET_CHAIN_IDS.includes(chainId)) {
      this.nativeCurrencyCache.set(typedChainId, LOCALNET_CURRENCY);
      return Promise.resolve(LOCALNET_CURRENCY);
    }

    if (!chainData.length) {
      try {
        const resp = await fetch(CHAIN_URL);
        if (!resp.ok) {
          throw new Error(`Failed to fetch chain data from ${CHAIN_URL}`);
        }

        chainData = await resp.json();
      } catch (error) {
        console.error('Unable to retrieve native token information', error);
        return null;
      }
    }

    const chain = chainData.find((chain) => chain.chainId === chainId);
    if (!chain) {
      console.error(`Found unsupported chainId ${chainId} for EVM`);
      return Promise.resolve(null);
    }

    // Parse the native currency
    const nativeCurrency = {
      ...chain.nativeCurrency,
      address: zeroAddress, // EVM native currency doesn't have an address
    };

    // Cache the native currency
    this.nativeCurrencyCache.set(typedChainId, nativeCurrency);

    return Promise.resolve(nativeCurrency);
  }

  async fetchFungibleCurrency(
    typedChainId: number,
    anchorAddress: string,
    provider: Provider
  ): Promise<ICurrency | null> {
    // First check if the fungible currency is already cached
    const cachedFungibleCurrency = this.fungibleCurrencyCache.get(typedChainId);
    if (cachedFungibleCurrency) {
      if (cachedFungibleCurrency instanceof Error) {
        return null;
      }

      return Promise.resolve(cachedFungibleCurrency);
    }

    // Validate the chainType is EVM and get the chaindId
    this.validateChainType(typedChainId);

    try {
      const vAcnhorContract = VAnchor__factory.connect(anchorAddress, provider);
      const fungibleCurrencyAddress = await retryPromise(vAcnhorContract.token);
      const fungibleCurrencyContract = ERC20__factory.connect(
        fungibleCurrencyAddress,
        provider
      );

      const [name, symbol, decimals] = await Promise.all([
        retryPromise(fungibleCurrencyContract.name),
        retryPromise(fungibleCurrencyContract.symbol),
        retryPromise(fungibleCurrencyContract.decimals),
      ]);
      const fungibleCurrency = {
        address: fungibleCurrencyAddress,
        decimals,
        symbol,
        name,
      };

      // Cache the fungible currency
      this.fungibleCurrencyCache.set(typedChainId, fungibleCurrency);
      return fungibleCurrency;
    } catch (error) {
      // Cache the error
      this.fungibleCurrencyCache.set(typedChainId, error as Error);
    }

    return null;
  }

  async fetchWrappableCurrencies(
    fungibleCurrency: ICurrency,
    typedChainId: number,
    provider: Provider
  ): Promise<ICurrency[]> {
    // First check if the wrappable currencies are already cached
    const cachedCurrencies = this.wrappableCurrenciesCache.get(typedChainId);
    if (cachedCurrencies) {
      if (cachedCurrencies instanceof Error) {
        return Promise.resolve([]);
      }

      return Promise.resolve(cachedCurrencies);
    }

    // Validate the chainType is EVM and get the chaindId
    this.validateChainType(typedChainId);

    const fungibleTokenWrapperContract = FungibleTokenWrapper__factory.connect(
      fungibleCurrency.address,
      provider
    );

    try {
      // Filter the zero addresses because they are not ERC20 tokens
      // and we use the isNativeAllowed flag to determine if native currency is allowed
      const addresses = (
        await retryPromise(fungibleTokenWrapperContract.getTokens)
      ).filter((address) => address !== zeroAddress);

      const wrappableERC20Contracts = addresses.map((address) =>
        ERC20__factory.connect(address, provider)
      );

      const wrappableCurrenciesResponse = await Promise.allSettled<ICurrency>(
        wrappableERC20Contracts.map(async (ERC20Contract) => {
          const [name, symbol, decimals] = await Promise.all([
            retryPromise(ERC20Contract.name),
            retryPromise(ERC20Contract.symbol),
            retryPromise(ERC20Contract.decimals),
          ]);
          return {
            address: ERC20Contract.address,
            decimals,
            symbol,
            name,
          };
        })
      );

      const wrappableCurrencies = wrappableCurrenciesResponse
        .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
        .filter((currency): currency is ICurrency => Boolean(currency));

      // Check if  is allowed
      const isNativeAllowed = await retryPromise(
        fungibleTokenWrapperContract.isNativeAllowed
      );
      if (isNativeAllowed) {
        const nativeCurrency = await this.fetchNativeCurrency(typedChainId);
        if (nativeCurrency) {
          wrappableCurrencies.push(nativeCurrency);
        }
      }

      // Cache the wrappable currencies
      this.wrappableCurrenciesCache.set(typedChainId, wrappableCurrencies);
      return wrappableCurrencies;
    } catch (error) {
      // Cache the error
      this.wrappableCurrenciesCache.set(typedChainId, error as Error);
    }

    return [];
  }

  async fetchCurrenciesConfig(
    anchorConfig: Record<number, string[]>,
    providerFactory: (typedChainId: number) => Provider,
    existedCurreniciesConfig: Record<number, CurrencyConfig> = {},
    // prettier-ignore
    existedFungibleToWrappableMap: Map<number, Map<number, Set<number>>> = new Map(),
    existedAnchorConfig: Record<number, ChainAddressConfig> = {}
  ): Promise<typeof cachedCurrenciesConfig> {
    if (cachedCurrenciesConfig) {
      return cachedCurrenciesConfig;
    }

    // Get all evm typed chain ids from the anchor config
    let evmTypedChainIds = Object.keys(anchorConfig)
      // Filter only evm chains
      .filter((typedChainId) => {
        const { chainType } = parseTypedChainId(+typedChainId);
        return chainType === ChainType.EVM;
      });

    // Filter the chains if it is not working
    const typedChainIdBooleans = await Promise.all(
      evmTypedChainIds.map(async (typedChainId) => {
        try {
          const provider = providerFactory(+typedChainId);
          await provider.getNetwork();
          return true;
        } catch (error) {
          return false;
        }
      })
    );
    evmTypedChainIds = evmTypedChainIds.filter(
      (_, index) => typedChainIdBooleans[index]
    );

    if (evmTypedChainIds.length === 0) {
      return {
        currenciesConfig: existedCurreniciesConfig,
        fungibleToWrappableMap: existedFungibleToWrappableMap,
        anchorConfig: existedAnchorConfig,
      };
    }

    // Fetch all native currencies (not in try catch because it not call any contract)
    const nativeCurrenciesWithNull = await Promise.all(
      evmTypedChainIds.map(async (typedChainId) => ({
        typedChainId: +typedChainId,
        nativeCurrency: await this.fetchNativeCurrency(+typedChainId),
      }))
    );

    const nativeCurrencies = nativeCurrenciesWithNull.filter(
      (
        currency
      ): currency is Pick<
        EVMCurrencyResponse,
        'typedChainId' | 'nativeCurrency'
      > => Boolean(currency.nativeCurrency)
    );

    // Fetch all fungible currencies
    const fungibleCurrenciesWithNull = await Promise.allSettled(
      nativeCurrencies.map(
        async ({ typedChainId, nativeCurrency: nativeCurrency }) => {
          const provider = providerFactory(typedChainId);

          // Support multiple anchor addresses for the same chain
          const anchorAddresses = anchorConfig[typedChainId];
          if (!anchorAddresses || anchorAddresses.length === 0) {
            console.error('No anchor address found for chain', typedChainId);
            return [];
          }

          // Fetch the fungible currency
          const fungibleCurrencies = await Promise.all(
            anchorAddresses.map(async (address) => {
              const fungible = await this.fetchFungibleCurrency(
                typedChainId,
                address,
                provider
              );

              return {
                typedChainId,
                nativeCurrency,
                fungibleCurrency: fungible,
                anchorAddress: address,
              };
            })
          );

          return fungibleCurrencies;
        }
      )
    );

    const fungibleCurrencies = fungibleCurrenciesWithNull
      .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
      .filter(
        (
          currencies
        ): currencies is {
          anchorAddress: string;
          fungibleCurrency: ICurrency | null;
          nativeCurrency: ICurrency;
          typedChainId: number;
        }[] => !!currencies && currencies.length > 0
      )
      .reduce((acc, currencies) => [...acc, ...currencies], [])
      .filter(
        (
          currency
        ): currency is {
          anchorAddress: string;
          fungibleCurrency: ICurrency;
          nativeCurrency: ICurrency;
          typedChainId: number;
        } => currency.fungibleCurrency !== null
      );

    // Fetch all wrappable currencies
    const wrappableCurrenciesWithNull = await Promise.allSettled(
      fungibleCurrencies.map(
        async ({
          typedChainId,
          nativeCurrency,
          fungibleCurrency,
          anchorAddress,
        }) => {
          const provider = providerFactory(typedChainId);
          const wrappables = await this.fetchWrappableCurrencies(
            fungibleCurrency,
            typedChainId,
            provider
          );

          return {
            anchorAddress,
            fungibleCurrency,
            nativeCurrency,
            typedChainId,
            wrappableCurrencies: wrappables,
          };
        }
      )
    );

    const wrappableCurrencies = wrappableCurrenciesWithNull
      .map((resp) => (resp.status === 'fulfilled' ? resp.value : null))
      .filter(
        (currency): currency is EVMCurrencyResponse =>
          parseInt(currency?.wrappableCurrencies.length.toString() ?? '0') > 0
      );

    return this.addCurrenciesIntoConfig(
      wrappableCurrencies,
      existedCurreniciesConfig,
      existedFungibleToWrappableMap,
      existedAnchorConfig
    );
  }

  private validateChainType(typedChainId: number) {
    const { chainType, chainId } = parseTypedChainId(typedChainId);
    assert(chainType === ChainType.EVM, 'Invalid chain type for EVM');

    return {
      chainType,
      chainId,
    };
  }

  private addCurrenciesIntoConfig(
    currenciesResponse: EVMCurrencyResponse[],
    currenciesConfig: Record<number, CurrencyConfig>,
    fungibleToWrappableMap: Map<number, Map<number, Set<number>>>,
    anchorConfig: Record<string, ChainAddressConfig>
  ) {
    currenciesResponse.forEach(
      ({
        anchorAddress,
        typedChainId,
        nativeCurrency,
        fungibleCurrency,
        wrappableCurrencies,
      }) => {
        // Add native currency
        const currentNative = Object.values(currenciesConfig).find(
          (currency) =>
            currency.name === nativeCurrency.name &&
            currency.symbol === nativeCurrency.symbol
        );

        const { address: nativeAddr, ...restNative } = nativeCurrency;

        if (!currentNative) {
          const nextId = Object.keys(currenciesConfig).length + 1;
          currenciesConfig[nextId] = {
            ...restNative,
            id: nextId,
            type: CurrencyType.NATIVE,
            role: CurrencyRole.Wrappable,
            addresses: new Map([[typedChainId, nativeAddr]]),
          };
        } else {
          if (
            currentNative.addresses.has(typedChainId) &&
            currentNative.addresses.get(typedChainId) !== nativeAddr
          ) {
            console.error(
              `Native currency ${currentNative.name} already exists on chain ${typedChainId}`
            );
          }

          currentNative.addresses.set(typedChainId, nativeAddr);
        }

        // Add fungible currency
        let currentFungible = Object.values(currenciesConfig).find(
          (currency) =>
            currency.name === fungibleCurrency.name &&
            currency.symbol === fungibleCurrency.symbol
        );

        const { address: fungbileAddr, ...restFungible } = fungibleCurrency;

        if (!currentFungible) {
          const nextId = Object.keys(currenciesConfig).length + 1;
          currentFungible = {
            ...restFungible,
            id: nextId,
            type: CurrencyType.ERC20,
            role: CurrencyRole.Governable,
            addresses: new Map([[typedChainId, fungbileAddr]]),
          };
          currenciesConfig[nextId] = currentFungible;
        } else {
          if (
            currentFungible.addresses.has(typedChainId) &&
            currentFungible.addresses.get(typedChainId) !== fungbileAddr
          ) {
            console.error(
              `Fungible currency ${currentFungible.name} already exists on chain ${typedChainId}`
            );
          }

          currentFungible.addresses.set(typedChainId, fungbileAddr);
        }

        // Add anchor
        const anchor = anchorConfig[currentFungible.id];
        if (!anchor) {
          anchorConfig[currentFungible.id] = {
            [typedChainId]: anchorAddress,
          };
        } else {
          if (anchor[typedChainId] && anchor[typedChainId] !== anchorAddress) {
            console.error(
              `Anchor for currency ${currentFungible.name} already exists on chain ${typedChainId}`,
              `Current: ${anchor[typedChainId]}, new one: ${anchorAddress}`
            );
          }

          anchor[typedChainId] = anchorAddress;
        }

        // Add wrappable currencies
        const wrappableCurrencyConfigs: CurrencyConfig[] = [];
        wrappableCurrencies.forEach(
          ({ address: wrappableAddr, ...restWrappable }) => {
            let currentWrappble = Object.values(currenciesConfig).find(
              (currency) =>
                currency.name === restWrappable.name &&
                currency.symbol === restWrappable.symbol
            );

            if (!currentWrappble) {
              const nextId = Object.keys(currenciesConfig).length + 1;
              currentWrappble = {
                ...restWrappable,
                id: nextId,
                type: CurrencyType.ERC20,
                role: CurrencyRole.Wrappable,
                addresses: new Map([[typedChainId, wrappableAddr]]),
              };
              currenciesConfig[nextId] = currentWrappble;
            } else {
              if (
                currentWrappble.addresses.has(typedChainId) &&
                currentWrappble.addresses.get(typedChainId) !== wrappableAddr
              ) {
                console.error(
                  `Wrappable currency ${currentWrappble.name} already exists on chain ${typedChainId}`
                );
              }

              currentWrappble.addresses.set(typedChainId, wrappableAddr);
            }

            wrappableCurrencyConfigs.push(currentWrappble);
          }
        );

        // Add fungible to wrappable map
        const wrappableIds = new Set(wrappableCurrencyConfigs.map((c) => c.id));
        const wrappableMap = fungibleToWrappableMap.get(currentFungible.id);
        if (!wrappableMap) {
          fungibleToWrappableMap.set(
            currentFungible.id,
            new Map([[typedChainId, wrappableIds]])
          );
        } else {
          wrappableMap.set(typedChainId, wrappableIds);
        }
      }
    );

    // Cache the config
    cachedCurrenciesConfig = {
      anchorConfig,
      currenciesConfig,
      fungibleToWrappableMap,
    };

    return cachedCurrenciesConfig;
  }
}
