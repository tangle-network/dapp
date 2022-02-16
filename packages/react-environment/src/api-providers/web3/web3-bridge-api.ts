import { ChainId, currenciesConfig, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { WebbWeb3Provider } from '@webb-dapp/react-environment/api-providers';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { CurrencyRole } from '@webb-dapp/react-environment/types/currency-config.interface';
import { AnchorBase, BridgeApi } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';

export class Web3BridgeApi extends BridgeApi<WebbWeb3Provider, BridgeConfig> {
  getTokenAddress(currencyId: WebbCurrencyId, chainId: ChainId): string | null {
    const activeBridgeAsset = this.store.activeBridge?.asset;
    return activeBridgeAsset ? currenciesConfig[activeBridgeAsset].addresses.get(chainId) ?? null : null;
  }

  async getCurrencies(): Promise<Currency[]> {
    const bridgeCurrenciesConfig = Object.values(currenciesConfig).filter((i) => i.role == CurrencyRole.Governable);
    return bridgeCurrenciesConfig.map((config) => {
      return Currency.fromCurrencyId(config.id);
    });
  }

  private get activeBridgeAsset() {
    return this.store.activeBridge?.asset ?? null;
  }

  async getCurrency(): Promise<Currency | null> {
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
}
