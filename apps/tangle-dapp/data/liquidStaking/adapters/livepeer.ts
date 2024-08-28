import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { SEPOLIA_TESTNET_CONTRACTS } from '../../../constants/liquidStaking/devConstants';
import {
  LsLiquifierProtocolDef,
  LsNetworkId,
  LsProtocolId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const LIVEPEER = {
  networkId: LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  id: LsProtocolId.LIVEPEER,
  name: 'Livepeer',
  chainIconFileName: 'livepeer',
  token: LsToken.LPT,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x58b6A8A3302369DAEc383334672404Ee733aB239'
    : SEPOLIA_TESTNET_CONTRACTS.ERC20,
  liquifierContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.LIQUIFIER,
  tgTokenContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.TG_TOKEN,
  unlocksContractAddress: IS_PRODUCTION_ENV
    ? '0x'
    : SEPOLIA_TESTNET_CONTRACTS.UNLOCKS,
  timeUnit: CrossChainTimeUnit.LIVEPEER_ROUND,
  unstakingPeriod: 7,
} as const satisfies LsLiquifierProtocolDef;

export default LIVEPEER;
