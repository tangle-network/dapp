'use client';

import { SnackbarProvider } from 'notistack';
import React, { useEffect, useState } from 'react';

import { NotificationItem } from './NotificationItem';
import { NotificationStacked } from './NotificationStacked';

export const NotificationProvider: React.FC<{
  children?: React.ReactNode;
  maxStack?: number;
}> = ({ children, maxStack = 3 }) => {
  const [domRoot, setDomRoot] = useState<HTMLElement | undefined>(undefined);

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
      <NotificationStacked children={children} />
    </SnackbarProvider>
  );
};
