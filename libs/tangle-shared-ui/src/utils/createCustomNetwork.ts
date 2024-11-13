import { TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL } from '@webb-tools/dapp-config/constants/tangle';
import getPolkadotJsDashboardUrl from '@webb-tools/dapp-config/utils/getPolkadotJsDashboardUrl';
import {
  Network,
  NetworkId,
} from '@webb-tools/webb-ui-components/constants/networks';

const createCustomNetwork = (customRpcEndpoint: string): Network => ({
  id: NetworkId.CUSTOM,
  name: 'Custom network',
  // Default to testnet symbol for all custom networks
  tokenSymbol: TANGLE_TESTNET_NATIVE_TOKEN_SYMBOL,
  nodeType: 'standalone',
  wsRpcEndpoint: customRpcEndpoint,
  polkadotJsDashboardUrl: getPolkadotJsDashboardUrl(customRpcEndpoint),
});

export default createCustomNetwork;
