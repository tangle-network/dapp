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
        <MetricItem title="Total Transactions" />
        <MetricItem title="TVL" isCurrency />
        <MetricItem title="Total Volume" isCurrency />
        <MetricItem title="Total Fees" isCurrency />
      </div>
    </div>
  );
};
