import { OptionsObject, SnackbarKey, VariantType } from 'notistack';
import React from 'react';

export type SnackBarOpts = {
  variant: VariantType;
  Icon?: JSX.Element;
  message: JSX.Element | string;
  secondaryMessage?: JSX.Element | string;
  key?: SnackbarKey;
  close(key: SnackbarKey): void;
  transparent?: boolean;
  autoHideDuration?: number;
  extras?: Partial<OptionsObject>;
};

export type NotificationContextProps = {
  addToQueue(opts: Omit<SnackBarOpts, 'close'>): SnackbarKey;
  remove(key: SnackbarKey): void;
};
export const NotificationCTXDefaultValue = {
  addToQueue(_opts: Omit<SnackBarOpts, 'close'>): SnackbarKey {
    return 0;
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  remove(_key: SnackbarKey) {},
};
export const NotificationContext = React.createContext<NotificationContextProps>(NotificationCTXDefaultValue);
