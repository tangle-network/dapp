import {
  LS_PARACHAIN_TOKENS,
  LsParachainToken,
  LsProtocolId,
} from '../../constants/liquidStaking/types';

function isLsParachainToken(
  tokenSymbol: string | LsProtocolId,
): tokenSymbol is LsParachainToken {
  return LS_PARACHAIN_TOKENS.includes(tokenSymbol as LsParachainToken);
}

export default isLsParachainToken;
