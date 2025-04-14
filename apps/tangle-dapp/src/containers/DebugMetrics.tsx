import { Expand } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useApiPromiseQuery } from '@tangle-network/tangle-shared-ui/hooks/useApiPromiseQuery';
import { useApiRxQuery } from '@tangle-network/tangle-shared-ui/hooks/useApiRxQuery';
import { SkeletonLoader, Typography } from '@tangle-network/ui-components';
import { FC, useEffect, useState } from 'react';

/**
 * Format bytes to megabytes, rounded to two decimal places
 * and suffixed with `mb`.
 */
function formatBytes(bytes: number): string {
  // The multiplier to convert bytes to megabytes.
  const MEGABYTE_FACTOR = 0.000001;

  return Math.round(bytes * MEGABYTE_FACTOR * 100) / 100 + 'mb';
}

const DebugMetrics: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const rpcEndpoint = useNetworkStore((store) => store.network2?.wsRpcEndpoint);

  const { data: api } = useApiRxQuery(rpcEndpoint);

  const { data: apiRx } = useApiPromiseQuery(rpcEndpoint);

  const isApiLoading = api === null || apiRx === null;
  const [tick, setTick] = useState(0);

  const totalRequests =
    (api?.stats?.total.requests ?? 0) + (apiRx?.stats?.total.requests ?? 0);

  const totalBytesReceived =
    (api?.stats?.total.bytesRecv ?? 0) + (apiRx?.stats?.total.bytesRecv ?? 0);

  const totalBytesSent =
    (api?.stats?.total.bytesSent ?? 0) + (apiRx?.stats?.total.bytesSent ?? 0);

  const totalErrors =
    (api?.stats?.total.errors ?? 0) + (apiRx?.stats?.total.errors ?? 0);

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
        value={`${totalActiveSubscriptions} active`}
        isApiLoading={isApiLoading}
      />

      <Metric
        title="Data usage"
        value={`${formatBytes(totalBytesReceived)} in, ${formatBytes(totalBytesSent)} out`}
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
      className="fixed z-10 flex flex-row max-w-lg gap-4 px-4 py-2 overflow-x-auto transition-opacity border rounded-md shadow-md opacity-50 cursor-pointer left-3 bottom-3 bg-mono-20 dark:bg-mono-180 border-mono-140 hover:opacity-100"
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
    <div className="flex flex-col w-max whitespace-nowrap">
      <Typography variant="body1" className="whitespace-nowrap">
        {title}
      </Typography>

      {isApiLoading ? (
        <SkeletonLoader />
      ) : (
        <Typography variant="h5" className={warnAfterClassName}>
          {value}
        </Typography>
      )}
    </div>
  );
};

export default DebugMetrics;
