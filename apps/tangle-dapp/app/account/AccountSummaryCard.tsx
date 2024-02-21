'use client';

import { SkeletonLoader } from '@webb-tools/webb-ui-components';
import type { PropsOf } from '@webb-tools/webb-ui-components/types';
import type { ElementRef } from 'react';
import { forwardRef } from 'react';

import Identity from '../../components/Identity';
import TangleCard from '../../components/TangleCard';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import Actions from './Actions';
import TotalBalance from './TotalBalance';

const AccountSummaryCard = forwardRef<ElementRef<'div'>, PropsOf<'div'>>(
  (props, ref) => {
    const activeAccountAddress = useActiveAccountAddress();

    return (
      <TangleCard {...props} ref={ref}>
        <div className="w-full space-y-5">
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
      </TangleCard>
    );
  }
);

AccountSummaryCard.displayName = 'AccountSummaryCard';

export default AccountSummaryCard;
