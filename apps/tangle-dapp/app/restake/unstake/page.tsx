'use client';

import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import { Button } from '@webb-tools/webb-ui-components';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useRef } from 'react';

import RestakeDetailCard from '../../../components/RestakeDetailCard';
import ActionButtonBase from '../ActionButtonBase';
import AssetPlaceholder from '../AssetPlaceholder';
import RestakeTabs from '../RestakeTabs';
import TxInfo from './TxInfo';

export const dynamic = 'force-static';

const Page = () => {
  return (
    <div className="grid items-start grid-cols-1 gap-4 sm:grid-cols-2 sm:justify-around">
      <div className="w-full max-w-lg mx-auto">
        <RestakeTabs />

        <form className="space-y-4" action="">
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
          </TransactionInputCard.Root>

          <TxInfo />

          <ActionButtonBase>
            {(isLoading, loadingText) => {
              return (
                <Button
                  isFullWidth
                  type="submit"
                  isLoading={isLoading}
                  loadingText={loadingText}
                >
                  Schedule Unstake
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </div>

      {/** Hardcoded for the margin top to ensure the component is align to same card content */}
      <RestakeDetailCard.Root className="max-w-lg mx-auto sm:mt-[61px]">
        <RestakeDetailCard.Header title="No unstake requests found" />

        <Typography
          variant="body2"
          className="text-mono-120 dark:text-mono-100"
        >
          You will be able to withdraw your tokens after the unstake request has
          been processed. To unstake your tokens go to the unstake tab to
          schedule request.
        </Typography>
      </RestakeDetailCard.Root>
    </div>
  );
};

export default Page;
