'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { forwardRef } from 'react';

import TangleCard from '../TangleCard';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import Balance from './Balance';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  (props, ref) => {
    return (
      <TangleCard {...props} ref={ref}>
        <div className="w-full space-y-5">
          <header>
            <AccountAddress />
          </header>

          <Balance />

          <Actions />
        </div>
      </TangleCard>
    );
  },
);

AccountSummaryCard.displayName = 'AccountSummaryCard';

export default AccountSummaryCard;
