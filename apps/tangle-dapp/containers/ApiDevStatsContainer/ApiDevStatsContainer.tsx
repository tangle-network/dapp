'use client';

import { Expand } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import usePromise from '../../hooks/usePromise';
import { getPolkadotApiPromise, getPolkadotApiRx } from '../../utils/polkadot';

const MEGABYTE_FACTOR = 0.000001;

function formatBytes(bytes: number): string {
  return Math.round(bytes * MEGABYTE_FACTOR * 100) / 100 + 'mb';
}

const ApiDevStats: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { result: api } = usePromise(getPolkadotApiPromise, null);
  const { result: apiRx } = usePromise(getPolkadotApiRx, null);
  const isApiLoading = api === null || apiRx === null;
  const [tick, setTick] = useState(0);

  const totalRequests =
    (api?.stats?.total.requests ?? 0) + (apiRx?.stats?.total.requests ?? 0);

  const totalSubscriptions =
    (api?.stats?.total.subscriptions ?? 0) +
    (apiRx?.stats?.total.subscriptions ?? 0);

  const totalBytesReceived =
    (api?.stats?.total.bytesRecv ?? 0) + (apiRx?.stats?.total.bytesRecv ?? 0);

  const totalBytesSent =
    (api?.stats?.total.bytesSent ?? 0) + (apiRx?.stats?.total.bytesSent ?? 0);

  const totalErrors =
    (api?.stats?.total.errors ?? 0) + (apiRx?.stats?.total.errors ?? 0);

  const totalActiveRequests =
    (api?.stats?.active.requests ?? 0) + (apiRx?.stats?.active.requests ?? 0);

  const totalActiveSubscriptions =
    (api?.stats?.active.subscriptions ?? 0) +
    (apiRx?.stats?.active.subscriptions ?? 0);

  // Manually trigger a re-render every second, since the stats
  // are not automatically updated.
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prevTick) => prevTick + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [tick]);

  const stats = (
    <>
      <Metric
        title="Requests"
        value={totalRequests}
        warnAt={100}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Subscriptions"
        value={totalSubscriptions}
        warnAt={100}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Requests (active)"
        value={totalActiveRequests}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Subscriptions (active)"
        value={totalActiveSubscriptions}
        warnAt={100}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Data sent"
        value={formatBytes(totalBytesSent)}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Data received"
        value={formatBytes(totalBytesReceived)}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Errors"
        value={totalErrors}
        warnAt={1}
        isApiLoading={isApiLoading}
      />
    </>
  );

  return (
    <div
      className="cursor-pointer fixed left-3 bottom-3 z-10 bg-mono-180 border border-mono-140 rounded-md shadow-md px-4 py-2 transition-opacity opacity-50 hover:opacity-100 flex flex-row gap-4 max-w-lg overflow-x-auto"
      onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}
    >
      {isCollapsed ? (
        <div>
          <Expand size="lg" />
        </div>
      ) : (
        stats
      )}
    </div>
  );
};

/** @internal */
const Metric: FC<{
  title: string;
  value: string | number;
  isApiLoading: boolean;
  warnAt?: number;
}> = ({ title, value, warnAt, isApiLoading }) => {
  const warnAfterClassName =
    warnAt !== undefined && typeof value === 'number' && value >= warnAt
      ? 'dark:text-red-40'
      : '';

  return (
    <div className="flex flex-col">
      <Typography variant="body1" className="whitespace-nowrap">
        {title}
      </Typography>

      {isApiLoading ? (
        <SkeletonLoader />
      ) : (
        <Typography variant="h4" className={warnAfterClassName}>
          {value}
        </Typography>
      )}
    </div>
  );
};

export default ApiDevStats;
