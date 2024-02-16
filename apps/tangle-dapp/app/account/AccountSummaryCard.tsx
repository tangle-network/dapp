'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Identity, TangleBigLogo } from '../../components';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import Actions from './Actions';
import TotalBalance from './TotalBalance';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    const activeAccountAddress = useActiveAccountAddress();

    return (
      <div
        {...props}
        className={twMerge(
          'relative rounded-2xl border-2 p-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          'dark:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]',
          'w-full flex items-center md:max-w-[556px] overflow-hidden',
          className
        )}
        ref={ref}
      >
        <div className="space-y-6 w-full">
          <header>
            {activeAccountAddress !== null ? (
              <Identity
                address={activeAccountAddress}
                fontWeight="normal"
                label="Address:"
                iconTooltipContent="Account public key"
              />
            ) : (
              <SkeletonLoader size="lg" />
            )}
          </header>

          <TotalBalance />

          <Actions />
        </div>

        <TangleBigLogo className="absolute top-[50%] translate-y-[-50%] right-0 translate-x-[30%] rounded-br-2xl" />
      </div>
    );
  }
);

AccountSummaryCard.displayName = AccountSummaryCard.name;

export default AccountSummaryCard;
