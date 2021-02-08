import { Dialog } from '@webb-dapp/ui-components';
import React, { memo, useCallback } from 'react';

const POLKADOT_EXTENSION_PAGE = 'https://polkadot.js.org/extension';

export const NoExtensions: React.FC = memo(() => {
  const handleGetExtensionBtnClick = useCallback((): void => {
    window.open(POLKADOT_EXTENSION_PAGE);
  }, []);

  return (
    <Dialog
      cancelText={undefined}
      confirmText='GET IT'
      onConfirm={handleGetExtensionBtnClick}
      title={null}
      visiable={true}
    >
      <p>{'No polkadot{.js} extension found, please install it first!'}</p>
      <a href={POLKADOT_EXTENSION_PAGE} rel='noopener noreferrer' target='_blank'>
        {'Get Polkadot{.js}'}
      </a>
    </Dialog>
  );
});

NoExtensions.displayName = 'NoExtensions';
