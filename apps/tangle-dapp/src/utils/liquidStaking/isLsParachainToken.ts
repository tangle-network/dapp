import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';

import { LS_PARACHAIN_TOKENS } from '../../constants/liquidStaking/constants';
import { LsParachainToken } from '../../constants/liquidStaking/types';

function isLsParachainToken(
  tokenSymbol: string | LsProtocolId,
): tokenSymbol is LsParachainToken {
  return LS_PARACHAIN_TOKENS.includes(tokenSymbol as LsParachainToken);
}

export default isLsParachainToken;
