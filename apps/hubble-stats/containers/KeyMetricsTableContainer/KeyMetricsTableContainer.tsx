'use client';

import { FC } from 'react';
import cx from 'classnames';

import { KeyMetricItem } from '../../components';

const KeyMetricsTableContainer: FC = () => {
  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden',
        'border-2 border-mono-0 dark:border-mono-160',
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.80)_0%,rgba(255,255,255,0.00)_100%)]',
        'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.80)0%,rgba(43,47,64,0.00)_100%)]'
      )}
    >
      <div className="w-full table table-fixed border-collapse">
        <KeyMetricItem title="Total Transactions" />
        <KeyMetricItem title="TVL" prefix="$" />
        <KeyMetricItem title="Total Volume" prefix="$" />
        <KeyMetricItem title="Total Fees" prefix="$" />
      </div>
    </div>
  );
};

export default KeyMetricsTableContainer;
