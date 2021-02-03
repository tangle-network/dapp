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
