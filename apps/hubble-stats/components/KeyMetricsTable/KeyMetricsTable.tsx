'use client';

import { FC } from 'react';
import cx from 'classnames';
import { MetricItem } from './MetricItem';

export const KeyMetricsTable: FC = () => {
  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden border-2 border-mono-0',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.00)_100%)]'
      )}
    >
      <div className={'w-full table table-fixed border-collapse'}>
        <MetricItem
          title="Total Transactions"
          value={8921}
          changeRate={13.688}
        />
        <MetricItem
          title="TVL"
          prefix="$"
          value={13_669_996}
          changeRate={-11}
        />
        <MetricItem
          title="Total Volume"
          prefix="$"
          value={59_121_994}
          changeRate={2.9999}
        />
        <MetricItem title="Total Fees" prefix="$" value={13_765} />
      </div>
    </div>
  );
};
