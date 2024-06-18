'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import type { FC } from 'react';

const DestChainInput: FC = () => {
  return (
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
  );
};

export default DestChainInput;
