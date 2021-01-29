/* eslint-disable sort-keys */
export type EndpointType = 'testnet' | 'production' | 'development';

export interface EndpointConfigItem {
  name: string;
  url: string;
}

export type EndpointConfig = Record<EndpointType, EndpointConfigItem[]>;

export const DEFAULT_ENDPOINTS: EndpointConfig = {
  production: [
    {
      name: 'Edgeware',
      url: 'wss://mainnet1.edgewa.re',
    },
  ],
  testnet: [
    // {
    //   name: 'Rococo Mandala',
    //   url: 'wss://rococo-demo-acala.phala.network/ws'
    // },
    // {
    //   name: 'Mandala TC5-1',
    //   url: 'wss://node-6714447553777491968.jm.onfinality.io/ws'
    // },
    // {
    //   name: 'Mandala TC5-2',
    //   url: 'wss://node-6714447553211260928.rz.onfinality.io/ws'
    // },
    // {
    //   name: 'Mandala TC5-3',
    //   url: 'wss://acala-testnet-1.polkawallet.io:9904'
    // },
    {
      name: 'Beresheet (Edgeware Testnet)',
      url: 'wss://beresheet1.edgewa.re',
    },
  ],
  development: [
    {
      name: 'Local',
      url: 'ws://127.0.0.1:9944',
    },
  ],
};
