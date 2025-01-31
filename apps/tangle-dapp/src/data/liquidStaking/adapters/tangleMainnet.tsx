import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';
import { TANGLE_MAINNET_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

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
