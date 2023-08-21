import cx from 'classnames';

import { KeyMetricItem } from '../../components';
import { getKeyMetricsData } from '../../data';

export default async function KeyMetricsTableContainer() {
  const {
    tvl,
    tvlChangeRate,
    volume,
    volumeChangeRate,
    relayerFees,
    wrappingFees,
  } = await getKeyMetricsData();

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
      title="Volume"
      prefix="$"
      value={volume}
      changeRate={volumeChangeRate}
    />
  );

  const RelayerFees = (
    <KeyMetricItem title="Relayer Fees" prefix="$" value={relayerFees} />
  );

  const WrappingFees = (
    <KeyMetricItem title="Wrapping Fees" prefix="$" value={wrappingFees} />
  );

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
        {Tvl}
        {Volume}
        {RelayerFees}
        {WrappingFees}
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <div className="w-full table table-fixed border-collapse">
          {Tvl}
          {Volume}
        </div>
        <div className="w-full table table-fixed border-collapse">
          {RelayerFees}
          {WrappingFees}
        </div>
      </div>
    </div>
  );
}
