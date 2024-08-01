'use client';

import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useRef } from 'react';

import AssetPlaceholder from '../AssetPlaceholder';
import RestakeTabs from '../RestakeTabs';

export const dynamic = 'force-static';

const Page = () => {
  return (
    <div className="grid items-start grid-cols-1 gap-4 sm:grid-cols-2 justify-stretch">
      <div className="max-w-lg">
        <RestakeTabs />

        <form className="space-y-4">
          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector placeholder="Select" />
              <TransactionInputCard.MaxAmountButton
                tooltipBody="Staked Balance"
                Icon={
                  useRef({
                    enabled: <LockLineIcon />,
                    disabled: <LockFillIcon />,
                  }).current
                }
              />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={
                useRef({
                  placeholder: <AssetPlaceholder />,
                  isDisabled: true,
                }).current
              }
            />

            {/* <ErrorMessage>{errors.amount?.message}</ErrorMessage> */}
          </TransactionInputCard.Root>
        </form>
      </div>
    </div>
  );
};

export default Page;
