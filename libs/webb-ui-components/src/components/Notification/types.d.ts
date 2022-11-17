import { SnackbarKey, SnackbarMessage } from 'notistack';
import { SnackBarOpts } from './NotificationContext';

export interface NotificationItemProps {
  opts: SnackBarOpts;
  $key: SnackbarKey;
  onUnmount?(key: SnackbarKey): void;
  onClose(): void;
}
