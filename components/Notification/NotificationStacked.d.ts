import { SnackbarKey } from 'notistack';
import { SnackBarOpts } from './types';
export declare const NotificationStacked: React.FC<{
    children?: React.ReactNode;
}>;
export declare const notificationApi: {
    (opts: Omit<SnackBarOpts, "close">): SnackbarKey;
    addToQueue(opts: Omit<SnackBarOpts, "close">): SnackbarKey;
    remove(key: SnackbarKey): void;
};
