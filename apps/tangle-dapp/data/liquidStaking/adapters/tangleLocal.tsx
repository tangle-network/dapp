import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import {
  LsNetworkId,
  LsProtocolId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const TANGLE_LOCAL = {
  networkId: LsNetworkId.TANGLE_LOCAL,
  id: LsProtocolId.TANGLE_LOCAL,
  name: 'Tangle',
  token: LsToken.T_TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_LOCAL_DEV_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_LOCAL_DEV_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_LOCAL;
