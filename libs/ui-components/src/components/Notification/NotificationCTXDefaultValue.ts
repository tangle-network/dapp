import { SnackbarKey } from 'notistack';
import { NotificationContextProps } from './types';

export const NotificationCTXDefaultValue: NotificationContextProps = {
  addToQueue(): SnackbarKey {
    return 0;
  },
  remove() {
    // do nothing
  },
} as const satisfies NotificationContextProps;
