import type { OptionsObject, SnackbarKey, VariantType } from 'notistack';

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
