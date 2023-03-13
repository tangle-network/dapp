import { CurrencyRole, EVMChainId } from '@webb-tools/dapp-types';
import { calculateTypedChainId, ChainType } from '@webb-tools/sdk-core';

import { ApiConfig } from '../api-config';
import { CurrencyConfig } from '../currencies';

export const anchorDeploymentBlock: Record<number, Record<string, number>> = {
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ArbitrumTestnet)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 10742623,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Goerli)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 8629410,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.Sepolia)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 3059851,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.OptimismTestnet)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 6504793,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.PolygonTestnet)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 32933455,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.MoonbaseAlpha)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 3911017,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AvalancheFuji)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 19699986,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.ScrollAlpha)]: {
    '0x12f721c568e907126e13d6664ebec606ee65ed3c': 292290,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.HermesLocalnet)]: {
    '0xc705034ded85e817b9E56C977E61A2098362898B': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.AthenaLocalnet)]: {
    '0x91eB86019FD8D7c5a9E31143D422850A13F670A3': 0,
  },
  [calculateTypedChainId(ChainType.EVM, EVMChainId.DemeterLocalnet)]: {
    '0x6595b34ED0a270B10a586FC1EA22030A95386f1e': 0,
  },
};

export const getAnchorDeploymentBlockNumber = (
  chainIdType: number,
  contractAddress: string
): number | undefined => {
  return Object.entries(anchorDeploymentBlock[chainIdType]).find(
    (entry) => entry[0].toLowerCase() === contractAddress.toLowerCase()
  )?.[1];
};

/**
 * Get the address of the latest anchor deployed on the chain
 * @param typedChainId the chainIdType of the chain
 * @returns the latest anchor address for the chain
 */
export const getLatestAnchorAddress = (
  typedChainId: number
): string | undefined => {
  const deploymentsBlock = anchorDeploymentBlock[typedChainId];
  if (!deploymentsBlock) {
    return undefined;
  }

  const [address] = Object.entries(deploymentsBlock).reduce(
    ([prevAddress, prevBlockNumber], [address, blockNumber]) => {
      if (blockNumber > prevBlockNumber) {
        return [address, blockNumber];
      }
      return [prevAddress, prevBlockNumber];
    }
  );

  return address;
};

// Cache the anchor config
let anchorsConfig: ApiConfig['anchors'];

/**
 * Get the anchor config for the currencies
 * @param currencies the currency config which is fetched on-chain
 * @returns the anchor config which is indexed by currencyId
 */
export const getAnchorConfig = async (
  currencies: Record<number, CurrencyConfig>
): Promise<ApiConfig['anchors']> => {
  // If the anchor config is already calculated, return it
  if (anchorsConfig) {
    return anchorsConfig;
  }

  const anchors: ApiConfig['anchors'] = {};

  const fungibleCurrencies = Object.values(currencies).filter(
    (currency) => currency.role === CurrencyRole.Governable
  );

  fungibleCurrencies.forEach((currency) => {
    anchors[currency.id] = Array.from(currency.addresses.entries()).reduce(
      (acc, [typedChainId]) => {
        const address = getLatestAnchorAddress(typedChainId);
        if (address) {
          acc[typedChainId] = address;
        } else {
          console.error('No anchor address found for chain', typedChainId);
        }
        return acc;
      },
      {} as Record<number, string>
    );
  });

  anchorsConfig = anchors;

  return anchors;
};
