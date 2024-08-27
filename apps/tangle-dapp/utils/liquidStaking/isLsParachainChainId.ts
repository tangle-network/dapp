import { LS_PARACHAIN_CHAIN_IDS } from '../../constants/liquidStaking/constants';
import {
  LsParachainChainId,
  LsProtocolId,
} from '../../constants/liquidStaking/types';

function isLsParachainChainId(
  protocolId: LsProtocolId,
): protocolId is LsParachainChainId {
  return LS_PARACHAIN_CHAIN_IDS.includes(protocolId as LsParachainChainId);
}

export default isLsParachainChainId;
