import { LS_LIQUIFIER_PROTOCOL_IDS } from '../../constants/liquidStaking/constants';
import { LsLiquifierProtocolId } from '../../constants/liquidStaking/types';

function isLiquifierProtocolId(
  protocolId: number,
): protocolId is LsLiquifierProtocolId {
  return LS_LIQUIFIER_PROTOCOL_IDS.includes(protocolId);
}

export default isLiquifierProtocolId;
