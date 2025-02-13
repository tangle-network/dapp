import { TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL } from '@tangle-network/dapp-config/constants/tangle';
import getPolkadotJsDashboardUrl from '@tangle-network/dapp-config/utils/getPolkadotJsDashboardUrl';
import {
  Network,
  NetworkId,
} from '@tangle-network/ui-components/constants/networks';

const createCustomNetwork = (customRpcEndpoint: string): Network => ({
  id: NetworkId.CUSTOM,
  name: 'Custom network',
  // Default to testnet symbol for all custom networks
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  wsRpcEndpoint: customRpcEndpoint,
  polkadotJsDashboardUrl: getPolkadotJsDashboardUrl(customRpcEndpoint),
  createExplorerAccountUrl: () => null,
  createExplorerTxUrl: () => null,
});

export default createCustomNetwork;
