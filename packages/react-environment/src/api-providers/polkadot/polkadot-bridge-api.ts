import { ChainId, currenciesConfig } from '@webb-dapp/apps/configs';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers';
import { BridgeConfig } from '@webb-dapp/react-environment/types/bridge-config.interface';
import { CurrencyRole, CurrencyType } from '@webb-dapp/react-environment/types/currency-config.interface';
import { AnchorBase, BridgeApi } from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { ORMLAsset } from '@webb-dapp/react-environment/webb-context/currency/orml-currency';

export class PolkadotBridgeApi extends BridgeApi<WebbPolkadot, BridgeConfig> {
  private ORMLCurrencies: Record<string, ORMLAsset> = {};

  private get activeBridgeAsset() {
    return this.store.activeBridge?.asset ?? null;
  }

  getTokenAddress(chainId: ChainId): string | null {
    return null;
  }

  async getCurrencies(): Promise<Currency[]> {
    const bridgeCurrenciesConfig = Object.values(currenciesConfig).filter(
      (i) => i.type === CurrencyType.ORML && i.role == CurrencyRole.Governable
    );
    return bridgeCurrenciesConfig.map((config) => {
      return Currency.fromCurrencyId(config.id);
    });
  }

  get currency(): Currency | null {
    return this.activeBridgeAsset ? Currency.fromCurrencyId(this.activeBridgeAsset) : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    return (
      this.store.activeBridge?.anchors.map((anchor) => ({
        amount: anchor.amount,
        neighbours: anchor.anchorTreeIds,
      })) ?? []
    );
  }

  async getWrappableAssets(chainId: ChainId): Promise<Currency[]> {
    return [];
  }
}
