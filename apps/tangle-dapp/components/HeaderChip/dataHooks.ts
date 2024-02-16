import useEraCountSubscription from '../../data/useEraCountSubscription';
import useSessionCountSubscription from '../../data/useSessionCountSubscription';

const dataHooks = {
  ERA: useEraCountSubscription,
  Session: useSessionCountSubscription,
} as const;

export default dataHooks;
