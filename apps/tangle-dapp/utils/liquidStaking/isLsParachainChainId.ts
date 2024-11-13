import { LsProtocolId } from '@webb-tools/tangle-shared-ui/types/liquidStaking';

import { LS_PARACHAIN_PROTOCOL_IDS } from '../../constants/liquidStaking/constants';
import { LsParachainChainId } from '../../constants/liquidStaking/types';

function isLsParachainChainId(
  protocolId: LsProtocolId,
): protocolId is LsParachainChainId {
  return LS_PARACHAIN_PROTOCOL_IDS.includes(protocolId as LsParachainChainId);
}

export default isLsParachainChainId;
