'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { Identity, TangleBigLogo } from '../../components';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import Actions from './Actions';
import TotalBalance from './TotalBalance';
import { AccountSummaryCardProps } from './types';

const AccountSummaryCard: FC<AccountSummaryCardProps> = ({ className }) => {
  const activeAccountAddress = useActiveAccountAddress();

  return (
    <div
      className={twMerge(
        'w-full flex items-center md:max-w-[556px] overflow-hidden',
        'relative rounded-2xl shadow-sm border-2 p-6',
        'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
        className
      )}
    >
      <div className="space-y-5 w-full">
        <header>
          {activeAccountAddress !== null ? (
            <Identity
              address={activeAccountAddress}
              iconTooltipContent="Account public key"
            />
          ) : (
            <SkeletonLoader size="lg" />
          )}
        </header>

        <TotalBalance />

        <Actions />
      </div>

      <TangleBigLogo className="absolute top-[50%] right-0 translate-y-[-50%]" />
    </div>
  );
};

export default AccountSummaryCard;
