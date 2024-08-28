import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { SEPOLIA_TESTNET_CONTRACTS } from '../../../constants/liquidStaking/devConstants';
import {
  LsLiquifierProtocolDef,
  LsNetworkId,
  LsProtocolId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const THE_GRAPH = {
  networkId: LsNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  id: LsProtocolId.THE_GRAPH,
  name: 'The Graph',
  chainIconFileName: 'the-graph',
  token: LsToken.GRT,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0xc944E90C64B2c07662A292be6244BDf05Cda44a7'
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
  timeUnit: CrossChainTimeUnit.DAY,
  unstakingPeriod: 28,
} as const satisfies LsLiquifierProtocolDef;

export default THE_GRAPH;
