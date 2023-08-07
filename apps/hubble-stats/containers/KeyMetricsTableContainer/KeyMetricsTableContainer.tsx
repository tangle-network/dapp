import cx from 'classnames';

import { KeyMetricItem } from '../../components';
import { getKeyMetricsData } from '../../data';

export default async function KeyMetricsTableContainer() {
  const {
    totalTx,
    txChangeRate,
    tvl,
    tvlChangeRate,
    volume,
    volumeChangeRate,
    fees,
  } = await getKeyMetricsData();

  const TotalTx = (
    <KeyMetricItem
      title="Total Transactions"
      value={totalTx}
      changeRate={txChangeRate}
    />
  );

  const Tvl = (
    <KeyMetricItem
      title="TVL"
      prefix="$"
      value={tvl}
      changeRate={tvlChangeRate}
    />
  );

  const Volume = (
    <KeyMetricItem
      title="Total Volume"
      prefix="$"
      value={volume}
      changeRate={volumeChangeRate}
    />
  );

  const Fees = <KeyMetricItem title="Total Fees" prefix="$" value={fees} />;

  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
      {/* Tablet and Desktop */}
      <div className="w-full hidden md:table table-fixed border-collapse">
        {TotalTx}
        {Tvl}
        {Volume}
        {Fees}
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <div className="w-full table table-fixed border-collapse">
          {TotalTx}
          {Tvl}
        </div>
        <div className="w-full table table-fixed border-collapse">
          {Volume}
          {Fees}
        </div>
      </div>
    </div>
  );
}
