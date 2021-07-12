import { AppConfig } from '@webb-dapp/react-environment/webb-context';

export const relayersConfig: AppConfig['relayers'] = {
  0: {
    id: 0,
    name: 'nepoche-relayer',
    endpoint: 'ws://nepoche.com:9955',
    fee: 0.01,
    address: '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2',
    async getParameters() {
      return Promise<null>();
    },

    supportedChainIds: [
      ChainId.EdgewareTestNet,
      ChainId.Rinkeby,
      ChainId.HarmonyTestnet1,
    ],
  },
};
