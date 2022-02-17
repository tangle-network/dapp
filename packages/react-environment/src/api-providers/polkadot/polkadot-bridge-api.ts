import { ChainId } from '@webb-dapp/apps/configs';
import { WebbPolkadot } from '@webb-dapp/react-environment/api-providers';
import {
  AnchorBase,
  BridgeApi,
  BridgeCurrencyIndex,
} from '@webb-dapp/react-environment/webb-context/bridge/bridge-api';
import { Currency } from '@webb-dapp/react-environment/webb-context/currency/currency';
import { ORMLAsset, ORMLCurrency } from '@webb-dapp/react-environment/webb-context/currency/orml-currency';

export type SubstrateBridgeConfigEntry = {
  treeId: string;
  depositSize: string;
  asset: string;
};

export class PolkadotBridgeApi extends BridgeApi<WebbPolkadot, SubstrateBridgeConfigEntry> {
  private ORMLCurrencies: Record<string, ORMLAsset> = {};

  private readonly ORMLAssetsApi: ORMLCurrency;

  constructor(inner: WebbPolkadot, s: Record<BridgeCurrencyIndex, SubstrateBridgeConfigEntry>) {
    super(inner, s);
    this.ORMLAssetsApi = new ORMLCurrency(inner);
    this.ORMLAssetsApi.list().then((assets) => {
      this.ORMLCurrencies = assets.reduce(
        (acc, asset) => ({
          ...acc,
          [`ORML@${asset.id}`]: asset,
        }),
        {}
      );
    });
    this.initAnchors()
      .then()
      .catch((e) => {
        console.log(e);
      });
  }

  private async initAnchors() {
    const api = this.inner.api;
    const anchors = await api.query.anchorBn254.anchors.entries();
    // @ts-ignore
    const data = anchors.map(([key, entry]): SubstrateBridgeConfigEntry => {
      const treeId = (key.toHuman() as Array<string>)[0];
      const anchor: { depositSize: string; asset: string } = entry.toHuman();
      return {
        asset: anchor.asset,
        depositSize: anchor.depositSize,
        treeId: treeId,
      };
    });
    this.store = {
      config: data.reduce(
        (acc, anchor) => ({
          ...acc,
          [`ORML@${anchor.asset}`]: anchor,
        }),
        {}
      ),
    };
  }

  getTokenAddress(chainId: ChainId): string | null {
    return null;
  }

  async getCurrencies(): Promise<Currency[]> {
    return Object.values(this.ORMLCurrencies).map((i) => Currency.fromORMLAsset(i));
  }

  private get activeBridgeAsset(): ORMLAsset | null {
    const asset = this.store.activeBridge?.asset;
    return asset ? this.ORMLCurrencies[`ORML@${asset}`] : null;
  }

  get currency(): Currency | null {
    return this.activeBridgeAsset ? Currency.fromORMLAsset(this.activeBridgeAsset) : null;
  }

  async getAnchors(): Promise<AnchorBase[]> {
    /*TODO: for substrate we assume anchors are in one chain*/
    return (Object.values(this.store.config) as SubstrateBridgeConfigEntry[]).map((i) => ({
      // zero as we don't have many chains
      neighbours: { 0: i.treeId },
      amount: i.depositSize,
    }));
  }

  async getWrappableAssets(chainId: ChainId): Promise<Currency[]> {
    return [];
  }
}
