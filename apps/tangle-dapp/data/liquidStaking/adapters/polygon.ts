import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { SEPOLIA_TESTNET_CONTRACTS } from '../../../constants/liquidStaking/constants';
import {
  LsLiquifierProtocolDef,
  LsProtocolId,
  LsProtocolNetworkId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const POLYGON = {
  networkId: LsProtocolNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  id: LsProtocolId.POLYGON,
  name: 'Polygon',
  chainIconFileName: 'polygon',
  token: LsToken.POL,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x0D500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
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
  timeUnit: CrossChainTimeUnit.POLYGON_CHECKPOINT,
  unstakingPeriod: 82,
} as const satisfies LsLiquifierProtocolDef;

export default POLYGON;
