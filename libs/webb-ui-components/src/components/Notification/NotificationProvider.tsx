import { SnackbarContent, SnackbarKey, SnackbarProvider } from 'notistack';
import React, { useCallback, useState } from 'react';

import { SnackBarOpts } from './NotificationContext';
import { NotificationItem } from './NotificationItem';
import { NotificationStacked } from './NotificationStacked';

export const NotificationProvider: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  const [notificationOptions] = useState<Record<SnackbarKey, SnackBarOpts>>({});

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

  return (
    <SnackbarProvider
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      autoHideDuration={5000}
      preventDuplicate
      maxSnack={10}
      domRoot={document.getElementById('notification-root') ?? undefined}
      content={(key) => {
        const opts = notificationOptions[key];

        if (!opts) {
          return null;
        }

        return (
          <SnackbarContent>
            <NotificationItem
              onUnmount={cleanOpt}
              $key={key}
              opts={opts}
              onClose={() => opts.close(key)}
            />
          </SnackbarContent>
        );
      }}
    >
      <NotificationStacked children={children} setOptions={appendOpt} />
    </SnackbarProvider>
  );
};
