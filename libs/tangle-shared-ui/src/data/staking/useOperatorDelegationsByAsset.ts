import useOperatorStakeByAsset, {
  type OperatorStakeByAsset,
} from '../staking/useOperatorStakeByAsset';

export { useOperatorStakeByAsset };
export type { OperatorStakeByAsset };

// Legacy alias kept for existing consumers that still import this hook.
export const useOperatorDelegationsByAsset = useOperatorStakeByAsset;

export default useOperatorStakeByAsset;
