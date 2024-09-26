import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
import {
  LsNetworkId,
  LsProtocolId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const TANGLE_MAINNET = {
  networkId: LsNetworkId.TANGLE_MAINNET,
  id: LsProtocolId.TANGLE_MAINNET,
  name: 'Tangle',
  token: LsToken.TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: IS_PRODUCTION_ENV
    ? TANGLE_MAINNET_NETWORK.wsRpcEndpoint
    : TANGLE_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_MAINNET_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_MAINNET_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_MAINNET;
