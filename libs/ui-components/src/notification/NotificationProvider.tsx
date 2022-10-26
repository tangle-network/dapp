import { SnackbarKey, useSnackbar } from 'notistack';
import React, { useCallback, useEffect } from 'react';

import { NotificationContext, NotificationCTXDefaultValue, SnackBarOpts } from './NotificationContext';

let _notificationApi = {
  ...NotificationCTXDefaultValue,
};
export const NotificationProvider: React.FC<{
  setOptions(key: SnackbarKey, opt: SnackBarOpts): void;
}> = ({ setOptions }) => {
  const { closeSnackbar, enqueueSnackbar } = useSnackbar();

  const addToQueue = useCallback(
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
      addToQueue,
      remove,
    };
  }, []);
  return (
    <NotificationContext.Provider
      value={{
        addToQueue,
        remove,
      }}
    />
  );
};

export const notificationApi = (opts: Omit<SnackBarOpts, 'close'>) => {
  return _notificationApi.addToQueue(opts);
};
notificationApi.addToQueue = (opts: Omit<SnackBarOpts, 'close'>): SnackbarKey => {
  return _notificationApi.addToQueue(opts);
};
notificationApi.remove = (key: SnackbarKey): void => {
  return _notificationApi.remove(key);
};
