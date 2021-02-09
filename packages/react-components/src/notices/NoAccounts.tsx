import { Dialog } from '@webb-dapp/ui-components';
import React, { FC, memo } from 'react';

export const NoAccounts: FC = memo(() => {
  const handleRetry = (): void => window.location.reload();

  return (
    <Dialog cancelText={undefined} confirmText='Retry' onConfirm={handleRetry} title={null} visiable={true}>
      <p>No account found, please add account in your wallet extension or unlock it!</p>
    </Dialog>
  );
});

NoAccounts.displayName = 'NoAccounts';
