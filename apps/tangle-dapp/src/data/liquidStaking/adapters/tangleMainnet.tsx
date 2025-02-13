import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import { TANGLE_MAINNET_NETWORK } from '@tangle-network/ui-components/constants/networks';

import {
  LsNetworkId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';

const TANGLE_MAINNET = {
  networkId: LsNetworkId.TANGLE_MAINNET,
  id: LsProtocolId.TANGLE_MAINNET,
  name: 'Tangle',
  token: LsToken.TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_MAINNET_NETWORK.wsRpcEndpoint,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_MAINNET_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_MAINNET_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_MAINNET;
