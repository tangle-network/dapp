import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import { TANGLE_LOCAL_DEV_NETWORK } from '@tangle-network/ui-components/constants/networks';

import {
  LsNetworkId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';

const TANGLE_LOCAL = {
  networkId: LsNetworkId.TANGLE_LOCAL,
  id: LsProtocolId.TANGLE_LOCAL,
  name: 'Tangle',
  token: LsToken.T_TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_LOCAL_DEV_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_LOCAL_DEV_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_LOCAL;
