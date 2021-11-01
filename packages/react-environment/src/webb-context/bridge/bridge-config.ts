import { ChainId, WebbCurrencyId } from '@webb-dapp/apps/configs';
import { BridgeCurrency } from '@webb-dapp/react-environment/webb-context/bridge/bridge-currency';

type ChainRecordConfig<T = string> = { [key in ChainId]?: T };
export type BridgeAnchor = {
  /// Anchor contract addresses Map
  anchorAddresses: ChainRecordConfig;
  amount: string;
};
export type BridgeConfigEntry = {
  asset: BridgeCurrency;
  /// Token contract addresses map
  tokenAddresses: ChainRecordConfig;
  anchors: BridgeAnchor[];
};
export type BridgeConfig = Record<string, BridgeConfigEntry>;

const webbETHtest1 = new BridgeCurrency([ChainId.Ropsten, ChainId.Rinkeby, ChainId.Goerli], WebbCurrencyId.WEBB);

export const bridgeConfig: BridgeConfig = {
  [webbETHtest1.name]: {
    asset: webbETHtest1,
    tokenAddresses: {
      [ChainId.Ropsten]: '0xE91EB19dd96512D33b7a87A8B56b63AF6db103e4',
      [ChainId.Rinkeby]: '0xcCD83a6ce5512C8dda9043Fc5F635816F66D8B63',
      [ChainId.Goerli]: '0x64E9727C4a835D518C34d3A50A8157120CAeb32F',
    },
    anchors: [
      {
        anchorAddresses: {
          [ChainId.Ropsten]: '0xB039952e6A46b890e2a44835d97dE253482b2Ca2',
          [ChainId.Rinkeby]: '0x33EAD0AE289f172E00BDD2e5c39BDF5b18F9d63A',
          [ChainId.Goerli]: '0x19b72e48a90975a5B9F88C5ae907607A13bf827A',
        },
        amount: '.01',
      },
    ],
  },
};
