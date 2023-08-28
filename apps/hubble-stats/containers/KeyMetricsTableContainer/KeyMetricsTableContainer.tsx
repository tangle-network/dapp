import cx from 'classnames';

import { KeyMetricItem } from '../../components';
import { getKeyMetricsData } from '../../data';

export default async function KeyMetricsTableContainer() {
  const {
    tvl,
    tvlChangeRate,
    volume24h,
    volumeChangeRate,
    relayerFees,
    wrappingFees,
  } = await getKeyMetricsData();

  const Tvl = (
    <KeyMetricItem
      title="TVL"
      suffix=" tTNT"
      value={tvl}
      changeRate={tvlChangeRate}
    />
  );

  const Volume = (
    <KeyMetricItem
      title="Volume 24H"
      suffix=" tTNT"
      value={volume24h}
      changeRate={volumeChangeRate}
    />
  );

  const RelayerFees = (
    <KeyMetricItem title="Relayer Fees" suffix=" tTNT" value={relayerFees} />
  );

  const WrappingFees = (
    <KeyMetricItem title="Wrapping Fees" suffix=" tTNT" value={wrappingFees} />
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
