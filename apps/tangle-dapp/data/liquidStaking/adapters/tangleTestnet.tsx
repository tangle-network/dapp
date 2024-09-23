import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config';
import {
  TANGLE_LOCAL_DEV_NETWORK,
  TANGLE_MAINNET_NETWORK,
  TANGLE_TESTNET_NATIVE_NETWORK,
} from '@webb-tools/webb-ui-components/constants/networks';

import { IS_PRODUCTION_ENV } from '../../../constants/env';
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
  name: 'Tangle',
  token: LsToken.TNT,
  chainIconFileName: 'tangle',
  decimals: TANGLE_TOKEN_DECIMALS,
  rpcEndpoint: IS_PRODUCTION_ENV
    ? TANGLE_MAINNET_NETWORK.wsRpcEndpoint
    : TANGLE_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  timeUnit: CrossChainTimeUnit.POLKADOT_ERA,
  unstakingPeriod: 28,
  ss58Prefix: TANGLE_MAINNET_NETWORK.ss58Prefix,
  tangleNetwork: TANGLE_TESTNET_NATIVE_NETWORK,
} as const satisfies LsTangleNetworkDef;

export default TANGLE_TESTNET;
