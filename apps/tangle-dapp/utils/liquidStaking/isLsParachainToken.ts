import { LsProtocolId, LsToken } from '../../constants/liquidStaking/types';

function isLsParachainToken(
  tokenSymbol: string | LsProtocolId,
): tokenSymbol is LsToken {
  return Object.values(LsToken).includes(tokenSymbol as LsToken);
}

export default isLsParachainToken;
