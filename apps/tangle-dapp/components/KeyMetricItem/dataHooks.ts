import {
  useActiveAndDelegationCountSubscription,
  useValidatorsCountSubscription,
  useWaitingCountSubscription,
} from '../../data';
import type { MetricReturnType } from '../../types';

const dataHooks: {
  [key: string]: (defaultValue?: MetricReturnType) => MetricReturnType;
} = {
  Validators: useValidatorsCountSubscription,
  Waiting: useWaitingCountSubscription,
  'Active/Delegation': useActiveAndDelegationCountSubscription,
} as const;

export default dataHooks;

export const defaultHook = (defaultValue: MetricReturnType = {}) =>
  defaultValue;
