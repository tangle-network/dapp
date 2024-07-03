'use client';

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
  persist?: boolean;
};

export type NotificationContextProps = {
  addToQueue(opts: Omit<SnackBarOpts, 'close'>): SnackbarKey;
  remove(key: SnackbarKey): void;
};

export const NotificationCTXDefaultValue: NotificationContextProps = {
  addToQueue(): SnackbarKey {
    return 0;
  },
  remove() {
    // do nothing
  },
} as const satisfies NotificationContextProps;
export const NotificationContext =
  React.createContext<NotificationContextProps>(NotificationCTXDefaultValue);
