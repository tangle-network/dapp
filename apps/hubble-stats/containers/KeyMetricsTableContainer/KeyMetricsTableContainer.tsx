import cx from 'classnames';

import { KeyMetricItem } from '../../components/KeyMetricItem';
import {
  getKeyMetricDepositData,
  getKeyMetricRelayerFeesData,
  getKeyMetricTvlData,
  getKeyMetricWrappingFeesData,
} from '../../data';

export default function KeyMetricsTableContainer(props: {
  epochStart: number;
  epochNow: number;
}) {
  const { epochNow, epochStart } = props;

  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160'
      )}
    >
      <div
        className={cx(
          'grid gap-1 grid-cols-2 md:grid-cols-4',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'md:[&>div]:even:border-r'
        )}
      >
        <KeyMetricItem
          title="TVL"
          suffix=" webbtTNT"
          dataFetcher={() => getKeyMetricTvlData(epochStart, epochNow)}
        />
        <KeyMetricItem
          title="Deposits 24H"
          suffix=" webbtTNT"
          dataFetcher={() => getKeyMetricDepositData(epochNow)}
        />
        <KeyMetricItem
          title="Relayer Earnings"
          suffix=" webbtTNT"
          tooltip="The net earnings made by relayers after transaction costs."
          dataFetcher={getKeyMetricRelayerFeesData}
        />
        <KeyMetricItem
          title="Wrapping Fees"
          suffix=" webbtTNT"
          dataFetcher={getKeyMetricWrappingFeesData}
        />
      </div>
    </div>
  );
}
