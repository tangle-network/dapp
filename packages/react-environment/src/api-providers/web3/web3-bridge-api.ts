import { ChainTypeId, chainTypeIdToInternalId, evmIdIntoInternalChainId } from '@webb-dapp/apps/configs';
import { WebbGovernedToken } from '@webb-dapp/contracts/contracts';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { CurrencyRole, CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import { AnchorBase, BridgeApi } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';

export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider, BridgeConfig> {
  getTokenAddress(chainTypeId: ChainTypeId): string | null {
    const activeBridgeAsset = this.store.activeBridge?.asset;
    const internalChainId = chainTypeIdToInternalId(chainTypeId);
    return activeBridgeAsset ? this.config.currencies[activeBridgeAsset].addresses.get(internalChainId) ?? null : null;
  }
  private get config() {
    return this.inner.config;
  }
  async getCurrencies(): Promise<Currency[]> {
    const currentChainId = await this.inner.getChainId();
    const internalChainId = evmIdIntoInternalChainId(currentChainId);
    const bridgeCurrenciesConfig = Object.values(this.config.currencies).filter((i) => {
      const isValid = i.role == CurrencyRole.Governable && i.type == CurrencyType.ERC20;
      const isSupported = Currency.fromCurrencyId(i.id).hasChain(internalChainId);
      return isSupported && isValid;
    });
    return bridgeCurrenciesConfig.map((config) => {
      return Currency.fromCurrencyId(config.id);
    });
  }

  private get activeBridgeAsset() {
    return this.store.activeBridge?.asset ?? null;
  }

  get currency(): Currency | null {
    return this.activeBridgeAsset ? Currency.fromCurrencyId(this.activeBridgeAsset) : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    return (
      this.store.activeBridge?.anchors.map((anchor) => ({
        amount: anchor.amount,
        neighbours: anchor.anchorAddresses,
      })) ?? []
    );
  }

  async getWrappableAssets(chainTypeId: ChainTypeId): Promise<Currency[]> {
    const bridge = this.activeBridge;
    const internalChainId = chainTypeIdToInternalId(chainTypeId);
    if (!bridge) {
      return [];
    }
    const wrappedTokenAddress = this.getTokenAddress(chainTypeId);
    if (!wrappedTokenAddress) {
      return [];
    }

    // Get the available token addresses which can wrap into the wrappedToken
    const wrappedToken = new WebbGovernedToken(this.inner.getEthersProvider(), wrappedTokenAddress);
    const tokenAddresses = await wrappedToken.tokens;
    // TODO: dynamic wrappable assets - consider some Currency constructor via address & default token config.

    // If the tokenAddress matches one of the wrappableCurrencies, return it
    const wrappableCurrencyIds = this.config.chains[internalChainId].currencies.filter((currencyId) => {
      const wrappableTokenAddress = this.config.currencies[currencyId].addresses.get(internalChainId);
      return wrappableTokenAddress && tokenAddresses.includes(wrappableTokenAddress);
    });
    if (await wrappedToken.isNativeAllowed()) {
      wrappableCurrencyIds.push(this.config.chains[internalChainId].nativeCurrencyId);
    }

    const wrappableCurrencies = wrappableCurrencyIds.map((currencyId) => {
      return Currency.fromCurrencyId(currencyId);
    });

    return wrappableCurrencies;
  }
}
