import cx from 'classnames';

import { KeyMetricItem } from '../../components';
import { getKeyMetricsData } from '../../data';

export default async function KeyMetricsTableContainer() {
  const {
    tvl,
    tvlChangeRate,
    deposit24h,
    depositChangeRate,
    relayerFees,
    wrappingFees,
  } = await getKeyMetricsData();

  const Tvl = (
    <KeyMetricItem
      title="TVL"
      suffix=" webbtTNT"
      value={tvl}
      changeRate={tvlChangeRate}
    />
  );

  const Deposit = (
    <KeyMetricItem
      title="Deposits 24H"
      suffix=" webbtTNT"
      value={deposit24h}
      changeRate={depositChangeRate}
    />
  );

  const RelayerFees = (
    <KeyMetricItem
      title="Relayer Earnings"
      suffix=" webbtTNT"
      value={relayerFees}
      tooltip="The net earnings made by relayers after transaction costs."
    />
  );

  const WrappingFees = (
    <KeyMetricItem
      title="Wrapping Fees"
      suffix=" webbtTNT"
      value={wrappingFees}
    />
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
        {Deposit}
        {RelayerFees}
        {WrappingFees}
      </div>

      {/* Mobile */}
      <div className="block md:hidden">
        <div className="w-full table table-fixed border-collapse">
          {Tvl}
          {Deposit}
        </div>
        <div className="w-full table table-fixed border-collapse">
          {RelayerFees}
          {WrappingFees}
        </div>
      </div>
    </div>
  );
}
