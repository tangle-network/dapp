import React, { useCallback, useState } from 'react';
import Button from '@material-ui/core/Button';
import { SnackbarContent, SnackbarKey, SnackbarProvider, useSnackbar, VariantType } from 'notistack';
import { Alert } from '@webb-dapp/ui-components/Notification/Notification';
import Slide from '@material-ui/core/Slide';
import { Icon } from '@material-ui/core';

function Not({ setOptions }: any) {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    enqueueSnackbar('I love snacks.');
  };

  const handleClickVariant = (variant: VariantType, opt: SnackBarOpts) => () => {
    // variant could be success, error, warning, info, or default
    const snackKey: SnackbarKey = new Date().getTime() + Math.random();
    setOptions(snackKey, opt);
    enqueueSnackbar('This is a success message!', {
      key: snackKey,
      variant,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        width: '500',
      }}
    >
      <Button onClick={handleClick}>Show snackbar</Button>
      <Button
        onClick={handleClickVariant('success', {
          message: 'hello',
          secondaryMessage: 'you',
          variant: 'success',
        })}
      >
        Show success snackbar
      </Button>
    </div>
  );
}

export type SnackBarOpts = {
  variant: VariantType;
  Icon?: JSX.Element;
  message: string;
  secondaryMessage?: string;
};

export function NotificationStacked() {
  const [options, _] = useState<Record<SnackbarKey, SnackBarOpts>>({});
  const cleanOpt = useCallback((key: SnackbarKey) => {
    delete options[key];
  }, []);
  const appendOpt = useCallback((key: SnackbarKey, opt: SnackBarOpts) => {
    options[key] = opt;
  }, []);
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={800000}
      TransitionComponent={(p) => <Slide {...p} direction={'left'} />}
      maxSnack={10}
      domRoot={document.getElementById('notification-root')}
      content={(key, message) => {
        const opts = options[key];
        if (!opts) {
          return <div />;
        }
        return (
          <SnackbarContent>
            <Alert onUnmount={cleanOpt} $key={key} message={message} opts={opts} />
          </SnackbarContent>
        );
      }}
    >
      <Not setOptions={appendOpt} />
    </SnackbarProvider>
  );
}
