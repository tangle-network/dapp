/* eslint-disable react-hooks/exhaustive-deps */
import { SnackbarKey, useSnackbar } from 'notistack';
import { useCallback, useEffect } from 'react';
import React from 'react';

import {
  NotificationContext,
  NotificationContextProps,
  NotificationCTXDefaultValue,
  SnackBarOpts,
} from './NotificationContext';

let _notificationApi = {
  ...NotificationCTXDefaultValue,
};
export const NotificationProvider: React.FC<{
  setOptions(key: SnackbarKey, opt: SnackBarOpts): void;
}> = ({ children, setOptions }) => {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const addToQue = useCallback(
    (opts: SnackBarOpts) => {
      const snackKey: SnackbarKey = opts.key || new Date().getTime() + Math.random();
      setOptions(snackKey, { ...opts, close: closeSnackbar });

      enqueueSnackbar(opts.message, {
        key: snackKey,
        variant: opts.variant,
        ...(opts.extras ?? {}),
      });
      return snackKey;
    },
    [enqueueSnackbar]
  );

  const remove = useCallback((key: SnackbarKey) => closeSnackbar(key), []);

  useEffect(() => {
    _notificationApi = {
      addToQue,
      remove,
    };
  }, []);
  return (
    <NotificationContext.Provider
      value={{
        addToQue,
        remove,
      }}
      children={children}
    />
  );
};

export const notificationApi = (opts: Omit<SnackBarOpts, 'close'>) => {
  return _notificationApi.addToQue(opts);
};
notificationApi.addToQue = (opts: Omit<SnackBarOpts, 'close'>): SnackbarKey => {
  return _notificationApi.addToQue(opts);
};
notificationApi.remove = (key: SnackbarKey): void => {
  return _notificationApi.remove(key);
};
