import React from 'react';
import Button from '@material-ui/core/Button';
import { SnackbarProvider, useSnackbar, VariantType } from 'notistack';
import { Alert } from '@webb-dapp/ui-components/Notification/Notification';
import Slide from '@material-ui/core/Slide';

function Not() {
  const { enqueueSnackbar } = useSnackbar();

  const handleClick = () => {
    enqueueSnackbar('I love snacks.');
  };

  const handleClickVariant = (variant: VariantType) => () => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar('This is a success message!', {
      variant,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        width: '500',
        top: 0,
      }}
    >
      <Button onClick={handleClick}>Show snackbar</Button>
      <Button onClick={handleClickVariant('success')}>Show success snackbar</Button>
    </div>
  );
}

export function NotificationStacked() {
  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      TransitionComponent={(p) => <Slide {...p} direction={'left'} />}
      maxSnack={10}
      domRoot={document.getElementById('notification-root')}
      content={(...p) => {
        return (
          <div {...p}>
            <Alert>asdfjkaklsdjf {p}</Alert>
          </div>
        );
      }}
    >
      <Not />
    </SnackbarProvider>
  );
}
