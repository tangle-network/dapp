'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';

import RestakeDetailCard from '../../../components/RestakeDetailCard';
import RestakeTabs from '../RestakeTabs';

export const dynamic = 'force-static';

const page = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:justify-around">
      <div className="w-full max-w-lg mx-auto">
        <RestakeTabs />

        <form action="">
          <TransactionInputCard.Root>
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector />
              <TransactionInputCard.MaxAmountButton />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body />
          </TransactionInputCard.Root>
        </form>
      </div>

      <RestakeDetailCard.Root className="max-w-lg mx-auto">
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

export default page;
