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
  addToQue(opts: Omit<SnackBarOpts, 'close'>): SnackbarKey;
  remove(key: SnackbarKey): void;
};
export const NotificationCTXDefaultValue = {
  addToQue(opts: Omit<SnackBarOpts, 'close'>): SnackbarKey {
    return 0;
  },
  remove(key: SnackbarKey) {},
};
export const NotificationContext = React.createContext<NotificationContextProps>(NotificationCTXDefaultValue);
