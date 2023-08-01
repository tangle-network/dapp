import { FC } from 'react';

import { KeyMetricItem } from '../../components';

const KeyMetricsTableContainer: FC = () => {
  return (
    <div className="w-full rounded-lg overflow-hidden border-2 border-mono-0 dark:border-mono-160 bg-glass dark:bg-glass_dark">
      {/* Tablet and Desktop */}
      <div className="w-full hidden md:table table-fixed border-collapse">
        <KeyMetricItem title="Total Transactions" />
        <KeyMetricItem title="TVL" prefix="$" />
        <KeyMetricItem title="Total Volume" prefix="$" />
        <KeyMetricItem title="Total Fees" prefix="$" />
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <div className="w-full table table-fixed border-collapse">
          <KeyMetricItem title="Total Transactions" />
          <KeyMetricItem title="TVL" prefix="$" />
        </div>
        <div className="w-full table table-fixed border-collapse">
          <KeyMetricItem title="Total Volume" prefix="$" />
          <KeyMetricItem title="Total Fees" prefix="$" />
        </div>
      </div>
    </div>
  );
};

export default KeyMetricsTableContainer;
