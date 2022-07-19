import { Slide } from '@mui/material';
import { Alert } from '@webb-dapp/ui-components/notification/Notification';
import { SnackBarOpts } from '@webb-dapp/ui-components/notification/NotificationContext';
import { NotificationProvider } from '@webb-dapp/ui-components/notification/NotificationProvider';
import { SnackbarContent, SnackbarKey, SnackbarProvider } from 'notistack';
import React, { useCallback, useState } from 'react';

export function NotificationStacked() {
  const [options, _] = useState<Record<SnackbarKey, SnackBarOpts>>({});
  const cleanOpt = useCallback(
    (key: SnackbarKey) => {
      delete options[key];
    },
    [options]
  );
  const appendOpt = useCallback(
    (key: SnackbarKey, opt: SnackBarOpts) => {
      options[key] = opt;
    },
    [options]
  );
  return (
    <SnackbarProvider
      anchorOrigin={{
        horizontal: 'right',
        vertical: 'top',
      }}
      autoHideDuration={5000}
      preventDuplicate
      TransitionComponent={(p) => <Slide {...(p as any)} direction={'left'} />}
      maxSnack={10}
      domRoot={document.getElementById('notification-root') ?? undefined}
      content={(key, message) => {
        const opts = options[key];
        if (!opts) {
          return <div />;
        }
        return (
          //@ts-ignore
          <SnackbarContent>
            <Alert onUnmount={cleanOpt} $key={key} message={message} opts={opts} />
          </SnackbarContent>
        );
      }}
    >
      <NotificationProvider setOptions={appendOpt} />
    </SnackbarProvider>
  );
}
