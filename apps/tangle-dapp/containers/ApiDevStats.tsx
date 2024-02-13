'use client';

import { Expand } from '@webb-tools/icons';
import { SkeletonLoader, Typography } from '@webb-tools/webb-ui-components';
import { FC, useEffect, useState } from 'react';

import usePromise from '../hooks/usePromise';
import { getPolkadotApiPromise, getPolkadotApiRx } from '../utils/polkadot';

const MEGABYTE_FACTOR = 0.000001;

function formatBytes(bytes: number): string {
  return Math.round(bytes * MEGABYTE_FACTOR * 100) / 100 + 'mb';
}

const ApiDevStats: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { result: api } = usePromise(getPolkadotApiPromise, null);
  const { result: apiRx } = usePromise(getPolkadotApiRx, null);
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

  const requestCountColorClassName =
    totalRequests > 100 ? 'dark:text-red-40' : '';

  const subscriptionCountColorClassName =
    totalSubscriptions > 100 ? 'dark:text-red-40' : '';

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
      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Requests
        </Typography>

        <Typography variant="h4" className={requestCountColorClassName}>
          {api === null ? <SkeletonLoader /> : totalRequests}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Subscriptions
        </Typography>

        <Typography variant="h4" className={subscriptionCountColorClassName}>
          {api === null ? <SkeletonLoader /> : totalSubscriptions}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Requests (active)
        </Typography>

        <Typography variant="h4">
          {api === null ? <SkeletonLoader /> : totalActiveRequests}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Subscriptions (active)
        </Typography>

        <Typography variant="h4">
          {api === null ? <SkeletonLoader /> : totalActiveSubscriptions}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Data sent
        </Typography>

        <Typography variant="h4">
          {api === null ? <SkeletonLoader /> : formatBytes(totalBytesSent)}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Data received
        </Typography>

        <Typography variant="h4">
          {api === null ? <SkeletonLoader /> : formatBytes(totalBytesReceived)}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body1" className="whitespace-nowrap">
          Errors
        </Typography>

        <Typography variant="h4">
          {api === null ? <SkeletonLoader /> : totalErrors}
        </Typography>
      </div>
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

export default ApiDevStats;
