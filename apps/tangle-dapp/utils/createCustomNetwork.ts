import { Network, NetworkId } from '@webb-tools/webb-ui-components/constants';

const createCustomNetwork = (customRpcEndpoint: string): Network => ({
  id: NetworkId.CUSTOM,
  name: 'Custom network',
  nodeType: 'standalone',
  rpcEndpoint: customRpcEndpoint,
  polkadotExplorerUrl: `https://polkadot.js.org/apps/?rpc=${customRpcEndpoint}#/explorer`,
});

export default createCustomNetwork;
