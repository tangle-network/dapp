import useEraCountSubscription from '../../data/HeaderChips/useEraCountSubscription';
import useSessionCountSubscription from '../../data/HeaderChips/useSessionCountSubscription';

const dataHooks = {
  ERA: useEraCountSubscription,
  Session: useSessionCountSubscription,
} as const;

export default dataHooks;
