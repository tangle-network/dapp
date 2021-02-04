/* eslint-disable sort-keys */
import { AppFeatures } from '@webb-dapp/ui-components/types';

export type EndpointType = 'testnet' | 'production' | 'development';

type Features = Record<AppFeatures, boolean>;

export interface EndpointConfigItem {
  name: string;
  url: string;
  features: Features;
}

export type EndpointConfig = Record<EndpointType, EndpointConfigItem[]>;
const endpointDefaults: Omit<EndpointConfigItem, 'name' | 'url'> = {
  features: {
    mixer: false,
    governance: true,
  },
};
export const DEFAULT_ENDPOINTS: EndpointConfig = {
  production: [
    {
      name: 'Edgeware',
      url: 'wss://mainnet1.edgewa.re',
      ...endpointDefaults,
    },
  ],
  testnet: [
    {
      name: 'Beresheet (Edgeware Testnet)',
      url: 'wss://beresheet1.edgewa.re',
      ...endpointDefaults,
    },
  ],
  development: [
    {
      name: 'Local',
      url: 'ws://127.0.0.1:9944',
      ...endpointDefaults,
      features: {
        ...endpointDefaults.features,
        mixer: true,
      },
    },
  ],
};
