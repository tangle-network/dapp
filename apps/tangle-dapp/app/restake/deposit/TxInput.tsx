'use client';

import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { Typography } from '@webb-tools/webb-ui-components';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import cx from 'classnames';

export default function TxInput() {
  return (
    <div className="space-y-2">
      <TransactionInputCard.Root>
        <TransactionInputCard.Header>
          <TransactionInputCard.ChainSelector />
          <TransactionInputCard.MaxAmountButton />
        </TransactionInputCard.Header>

        <TransactionInputCard.Body customAmountProps={{ type: 'number' }} />
      </TransactionInputCard.Root>

      <ArrowRight size="lg" className="mx-auto rotate-90" />

      <div className="relative">
        <TransactionInputCard.Root>
          <TransactionInputCard.Header>
            <TransactionInputCard.ChainSelector />
            <TransactionInputCard.MaxAmountButton accountType="note" disabled />
          </TransactionInputCard.Header>

          <TransactionInputCard.Body />
        </TransactionInputCard.Root>

        <div
          className={cx(
            'absolute inset-0 flex items-center justify-center',
            'rounded-lg bg-mono-200/25 dark:bg-mono-200/75',
          )}
        >
          <Typography variant="body1" className="cursor-default text-mono-140">
            Bridging will be available soon
          </Typography>
        </div>
      </div>
    </div>
  );
}
