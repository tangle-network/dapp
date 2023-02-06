import { InteractiveFeedback } from '@webb-tools/dapp-types';

export interface InteractiveFeedbackViewProps {
  activeFeedback: InteractiveFeedback | null;
}

export interface UnselectedNetworkViewProps {
  activeFeedback: InteractiveFeedback;
}

export interface DefaultErrorViewProps extends UnselectedNetworkViewProps {}
