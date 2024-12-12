'use client';

import { FC } from 'react';

import GlassCardWithLogo from '../GlassCardWithLogo';
import AccountAddress from './AccountAddress';
import Actions from './Actions';
import Balance from './Balance';

const AccountSummaryCard: FC<{ className?: string }> = ({ className }) => {
  return (
    <GlassCardWithLogo className={className}>
      <div className="w-full space-y-5">
        <header>
          <AccountAddress />
        </header>

        <Balance />

        <Actions />
      </div>
    </GlassCardWithLogo>
  );
};

export default AccountSummaryCard;
