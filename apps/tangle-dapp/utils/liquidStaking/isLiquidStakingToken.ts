import { LsToken } from '../../constants/liquidStaking';

function isLiquidStakingToken(tokenSymbol: string): tokenSymbol is LsToken {
  return Object.values(LsToken).includes(tokenSymbol as LsToken);
}

export default isLiquidStakingToken;
