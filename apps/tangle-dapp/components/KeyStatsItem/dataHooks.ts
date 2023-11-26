import useActiveAndDelegationCountSubscription from '../../data/KeyStats/useActiveAndDelegationCountSubscription';
import useIdealStakePercentage from '../../data/KeyStats/useIdealStakePercentage';
import useInflationPercentage from '../../data/KeyStats/useInflationPercentage';
import useValidatorsCountSubscription from '../../data/KeyStats/useValidatorsCountSubscription';
import useWaitingCountSubscription from '../../data/KeyStats/useWaitingCountSubscription';

const dataHooks = {
  Validators: useValidatorsCountSubscription,
  Waiting: useWaitingCountSubscription,
  'Active/Delegation': useActiveAndDelegationCountSubscription,
  'Ideal Staked': useIdealStakePercentage,
  Inflation: useInflationPercentage,
} as const;

export default dataHooks;
