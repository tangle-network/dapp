import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';

const createCustomNetwork = (customRpcEndpoint: string): Network => ({
  id: NetworkId.CUSTOM,
  name: 'Custom network',
  nodeType: 'standalone',
  wsRpcEndpoint: customRpcEndpoint,
  polkadotExplorerUrl: `https://polkadot.js.org/apps/?rpc=${customRpcEndpoint}#/explorer`,
});

export default createCustomNetwork;
