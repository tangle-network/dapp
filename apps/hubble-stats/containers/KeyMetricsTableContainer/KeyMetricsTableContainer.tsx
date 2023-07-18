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
        'backdrop-blur-xl'
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
