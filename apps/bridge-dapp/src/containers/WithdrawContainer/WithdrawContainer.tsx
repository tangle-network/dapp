import { WithdrawCard } from '@webb-tools/webb-ui-components';
import React, { forwardRef } from 'react';
import { WithdrawContainerProps } from './types';

export const WithdrawContainer = forwardRef<
  HTMLDivElement,
  WithdrawContainerProps
>((props, ref) => {
  return (
    <div>
      <WithdrawCard />
    </div>
  );
});
