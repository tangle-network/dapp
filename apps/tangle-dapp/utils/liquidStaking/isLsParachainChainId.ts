import {
  LS_PARACHAIN_CHAIN_IDS,
  LsParachainChainId,
  LsProtocolId,
} from '../../constants/liquidStaking/types';

function isLsParachainChainId(
  protocolId: LsProtocolId,
): protocolId is LsParachainChainId {
  return LS_PARACHAIN_CHAIN_IDS.includes(protocolId as LsParachainChainId);
}

export default isLsParachainChainId;
