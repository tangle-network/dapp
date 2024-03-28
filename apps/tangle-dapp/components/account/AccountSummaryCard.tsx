'use client';

import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { forwardRef } from 'react';

import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import TangleCard from '../TangleCard';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import TotalBalance from './TotalBalance';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  (props, ref) => {
    const activeAccountAddress = useActiveAccountAddress();

    return (
      <TangleCard {...props} ref={ref}>
        <div className="w-full space-y-5">
          <header>
            <AccountAddress activeAddress={activeAccountAddress} />
          </header>

          <TotalBalance />

          <Actions />
        </div>
      </TangleCard>
    );
  }
);

AccountSummaryCard.displayName = 'AccountSummaryCard';

export default AccountSummaryCard;
