'use client';

import cx from 'classnames';
import useSWR from 'swr';
import KeyMetricItem from '../../components/KeyMetricItem/KeyMetricItem';
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

  const { data: tvlData, isLoading: tvlLoading } = useSWR(
    [getKeyMetricTvlData.name, epochStart, epochNow],
    ([, ...args]) => getKeyMetricTvlData(...args),
  );

  const { data: depositData, isLoading: depositLoading } = useSWR(
    [getKeyMetricDepositData.name, epochNow],
    ([, ...args]) => getKeyMetricDepositData(...args),
  );

  const { data: relayerFeesData, isLoading: relayerFeesLoading } = useSWR(
    getKeyMetricRelayerFeesData.name,
    getKeyMetricRelayerFeesData,
  );

  const { data: wrappingFeesData, isLoading: wrappingFeesLoading } = useSWR(
    getKeyMetricWrappingFeesData.name,
    getKeyMetricWrappingFeesData,
  );

  return (
    <div
      className={cx(
        'w-full rounded-lg overflow-hidden',
        'bg-glass dark:bg-glass_dark',
        'border-2 border-mono-0 dark:border-mono-160',
      )}
    >
      <div
        className={cx(
          'grid gap-1 grid-cols-2 md:grid-cols-4',
          '[&>div]:border-r [&>div]:border-r-mono-40 [&>div]:dark:border-r-mono-160',
          '[&>div]:even:border-none',
          'md:[&>div]:even:border-r',
        )}
      >
        <KeyMetricItem
          title="TVL"
          suffix=" webbtTNT"
          isLoading={tvlLoading}
          value={tvlData}
        />
        <KeyMetricItem
          title="Deposits 24H"
          suffix=" webbtTNT"
          isLoading={depositLoading}
          value={depositData}
        />
        <KeyMetricItem
          title="Relayer Earnings"
          suffix=" webbtTNT"
          tooltip="The net earnings made by relayers after transaction costs."
          isLoading={relayerFeesLoading}
          value={relayerFeesData}
        />
        <KeyMetricItem
          title="Wrapping Fees"
          suffix=" webbtTNT"
          isLoading={wrappingFeesLoading}
          value={wrappingFeesData}
        />
      </div>
    </div>
  );
}
