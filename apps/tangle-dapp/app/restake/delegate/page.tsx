'use client';

import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import RestakeTabs from '../RestakeTabs';

const amountError = '';

export default function DelegatePage() {
  return (
    <form className="relative h-full overflow-hidden">
      <div className="flex flex-col h-full space-y-4 grow">
        <RestakeTabs />

        <div className="space-y-2">
          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector placeholder="Select Operator" />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{ placeHolder: 'Select Asset' }}
            />

            <Typography
              component="p"
              variant="body4"
              fw="bold"
              className="h-4 mt-2 text-red-70 dark:text-red-50"
            >
              {amountError}
            </Typography>
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <FeeDetails
            isDefaultOpen
            items={[
              {
                name: 'Unstake period',
                info: 'Number of rounds that delegators remain bonded before the exit request is executable.',
              },
            ]}
          />

          <Button isFullWidth>Delegate</Button>
        </div>
      </div>
    </form>
  );
}
