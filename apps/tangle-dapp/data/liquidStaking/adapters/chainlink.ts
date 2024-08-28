import { IS_PRODUCTION_ENV } from '../../../constants/env';
import { SEPOLIA_TESTNET_CONTRACTS } from '../../../constants/liquidStaking/constants';
import {
  LsLiquifierProtocolDef,
  LsProtocolId,
  LsProtocolNetworkId,
  LsToken,
} from '../../../constants/liquidStaking/types';
import { CrossChainTimeUnit } from '../../../utils/CrossChainTime';

const CHAINLINK = {
  networkId: LsProtocolNetworkId.ETHEREUM_MAINNET_LIQUIFIER,
  id: LsProtocolId.CHAINLINK,
  name: 'Chainlink',
  chainIconFileName: 'chainlink',
  token: LsToken.LINK,
  decimals: 18,
  erc20TokenAddress: IS_PRODUCTION_ENV
    ? '0x514910771AF9Ca656af840dff83E8264EcF986CA'
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
  unstakingPeriod: 7,
} as const satisfies LsLiquifierProtocolDef;

export default CHAINLINK;
