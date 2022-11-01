import { DepositCard } from '@webb-tools/webb-ui-components';
import React, { forwardRef } from 'react';
import { DepositContainerProps } from './types';

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  return (
    <div>
      <DepositCard />
    </div>
  );
});
