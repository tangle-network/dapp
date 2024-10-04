import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import { TANGLE_TESTNET_NATIVE_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';

import {
  LsNetworkId,
  LsProtocolId,
  LsTangleNetworkDef,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const TANGLE_TESTNET = {
  networkId: LsNetworkId.TANGLE_TESTNET,
  id: LsProtocolId.TANGLE_TESTNET,
  name: 'Tangle Testnet',
  token: LsToken.TTNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: TANGLE_TESTNET_NATIVE_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 14,
  ss58Prefix: TANGLE_TESTNET_NATIVE_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_TESTNET_NATIVE_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_TESTNET;
