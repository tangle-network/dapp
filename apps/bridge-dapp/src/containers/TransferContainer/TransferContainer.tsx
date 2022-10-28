import { TransferCard } from '@webb-tools/webb-ui-components';
import React, { forwardRef } from 'react';
import { TransferContainerProps } from './types';

export const TransferContainer = forwardRef<
  HTMLDivElement,
  TransferContainerProps
>((props, ref) => {
  return (
    <div>
      <TransferCard />
    </div>
  );
});
