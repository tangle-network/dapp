'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { FC, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import Identity from '../../components/Identity';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import Actions from './Actions';
import TangleLogo from './TangleLogo';
import TotalBalance from './TotalBalance';

const AccountSummaryCard: FC = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  ({ className, ...props }, ref) => {
    const activeAccountAddress = useActiveAccountAddress();

    return (
      <div
        {...props}
        className={twMerge(
          'w-full flex items-center md:max-w-[556px] overflow-hidden',
          'relative rounded-2xl shadow-sm border-2 p-6',
          'border-mono-0 bg-mono-0/70 dark:border-mono-160 dark:bg-mono-0/5',
          className
        )}
        ref={ref}
      >
        <div className="space-y-5 w-full">
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

        <TangleLogo className="absolute top-[50%] right-0 translate-y-[-50%]" />
      </div>
    );
  }
);

AccountSummaryCard.displayName = 'AccountSummaryCard';

export default AccountSummaryCard;
