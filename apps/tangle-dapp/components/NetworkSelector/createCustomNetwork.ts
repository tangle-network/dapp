import { Network } from '@webb-tools/webb-ui-components/constants';

const createCustomNetwork = (customRpcEndpoint: string): Network => ({
  name: 'Custom network',
  networkType: 'dev',
  networkNodeType: 'standalone',
  subqueryEndpoint: '',
  polkadotEndpoint: customRpcEndpoint,
  polkadotExplorer: `https://polkadot.js.org/apps/?rpc=${customRpcEndpoint}#/explorer`,
  avatar: '',
});

export default createCustomNetwork;
