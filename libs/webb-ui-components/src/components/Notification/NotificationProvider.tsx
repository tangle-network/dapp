import { SnackbarKey, SnackbarProvider } from 'notistack';
import React, { useCallback, useEffect, useState } from 'react';

import { SnackBarOpts } from './NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationStacked } from './NotificationStacked';

export const NotificationProvider: React.FC<{
  children?: React.ReactNode;
  maxStack?: number;
}> = ({ children, maxStack = 3 }) => {
  const [notificationOptions] = useState<Record<SnackbarKey, SnackBarOpts>>({});

  const [domRoot, setDomRoot] = useState<HTMLElement | undefined>(undefined);

  const cleanOpt = useCallback(
    (key: SnackbarKey) => {
      delete notificationOptions[key];
    },
    [notificationOptions]
  );

  const appendOpt = useCallback(
    (key: SnackbarKey, opt: SnackBarOpts) => {
      notificationOptions[key] = opt;
    },
    [notificationOptions]
  );

  useEffect(() => {
    setDomRoot(document?.getElementById('notification-root') ?? undefined);
  }, []);

  return (
    <SnackbarProvider
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      autoHideDuration={5000}
      preventDuplicate
      maxSnack={maxStack}
      domRoot={domRoot}
      Components={{
        default: NotificationItem,
        error: NotificationItem,
        info: NotificationItem,
        success: NotificationItem,
        warning: NotificationItem,
      }}
    >
      <NotificationStacked children={children} setOptions={appendOpt} />
    </SnackbarProvider>
  );
};
