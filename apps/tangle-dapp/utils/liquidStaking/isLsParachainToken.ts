import { LsParachainToken } from '../../constants/liquidStaking/liquidStakingParachain';

function isLsParachainToken(
  tokenSymbol: string,
): tokenSymbol is LsParachainToken {
  return Object.values(LsParachainToken).includes(
    tokenSymbol as LsParachainToken,
  );
}

export default isLsParachainToken;
