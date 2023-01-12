import { InteractiveFeedback } from '@webb-tools/dapp-types';
import { NotificationPayload } from '@webb-tools/abstract-api-provider';

export type RegisterInteractiveFeedback = (
  setter: RegisterInteractiveFeedbackSetter,
  interactiveFeedback: InteractiveFeedback
) => void;
export type RegisterInteractiveFeedbackSetter = (
  update: (p: InteractiveFeedback[]) => InteractiveFeedback[]
) => any;

export type NotificationHandier = ((
  notification: NotificationPayload
) => string | number) & {
  remove(key: string | number): void;
};
