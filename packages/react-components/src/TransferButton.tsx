import React, { FC, memo } from 'react';

import { CurrencyId } from '@webb-tools/types/interfaces/types';
import { Button } from '@webb-dapp/ui-components';
import { useModal } from '@webb-dapp/react-hooks';
import { BareProps } from '@webb-dapp/ui-components/types';
import { TransferModal } from './TransferModal';

interface Props extends BareProps {
  mode: 'token' | 'lp-token';
  currency: CurrencyId;
}

export const TransferButton: FC<Props> = memo(({ children, className, currency, mode }) => {
  const { close, status, toggle } = useModal();

  return (
    <>
      <Button className={className} onClick={toggle} size='small'>
        {children || 'Transfer'}
      </Button>
      {status ? <TransferModal defaultCurrency={currency} mode={mode} onClose={close} visiable={status} /> : null}
    </>
  );
});

TransferButton.displayName = 'TransferButton';
