import { LiquidStakingToken } from '../../constants/liquidStaking';

function isLiquidStakingToken(
  tokenSymbol: string,
): tokenSymbol is LiquidStakingToken {
  return Object.values(LiquidStakingToken).includes(
    tokenSymbol as LiquidStakingToken,
  );
}

export default isLiquidStakingToken;
