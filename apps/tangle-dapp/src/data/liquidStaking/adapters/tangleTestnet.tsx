import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { LsProtocolId } from '@tangle-network/tangle-shared-ui/types/liquidStaking';
import { TANGLE_TESTNET_NATIVE_NETWORK } from '@tangle-network/ui-components/constants/networks';

import {
  LsNetworkId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';

const TANGLE_TESTNET = {
  networkId: LsNetworkId.TANGLE_TESTNET,
  id: LsProtocolId.TANGLE_TESTNET,
  name: 'Tangle',
  token: LsToken.T_TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_TESTNET_NATIVE_NETWORK.wsRpcEndpoint,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_TESTNET_NATIVE_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_TESTNET_NATIVE_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_TESTNET;
