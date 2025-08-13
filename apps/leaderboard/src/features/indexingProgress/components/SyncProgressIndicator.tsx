import { CrossCircledIcon } from '@radix-ui/react-icons';
import { StatusIndicator } from '@tangle-network/icons';
import { NetworkType } from '@tangle-network/tangle-shared-ui/graphql/graphql';
import {
  Chip,
  EMPTY_VALUE_PLACEHOLDER,
  SlidingNumber,
} from '@tangle-network/ui-components';
import { useMemo } from 'react';
import { useIndexingProgress } from '../queries';

export const SyncProgressIndicator = ({
  network,
}: {
  network: NetworkType;
}) => {
  const { data, error, isPending } = useIndexingProgress(network);

  const progress = useMemo(() => {
    if (!data?.lastProcessedHeight || !data?.targetHeight) {
      return 0;
    }

    // Round to 2 decimal places
    return (
      Math.round((data.lastProcessedHeight / data.targetHeight) * 100 * 100) /
      100
    );
  }, [data?.lastProcessedHeight, data?.targetHeight]);

  const isSynced = useMemo(() => {
    if (!data?.lastProcessedHeight || !data?.targetHeight) {
      return false;
    }

    return data.lastProcessedHeight === data.targetHeight;
  }, [data?.lastProcessedHeight, data?.targetHeight]);

  const displayContent = useMemo(() => {
    if (isPending) {
      return (
        <>
          <StatusIndicator variant="info" animated />
          Loading indexing status...
        </>
      );
    }

    if (error) {
      return (
        <>
          <CrossCircledIcon className="text-red-500" />
          Error loading indexing status
        </>
      );
    }

    return (
      <>
        <StatusIndicator
          variant={isSynced ? 'success' : 'info'}
          animated={!isSynced}
        />
        <span className="flex items-center gap-1">
          {isSynced ? 'Synced' : 'Indexing'}

          <span className="inline-block">
            {data?.lastProcessedHeight ? (
              <SlidingNumber number={data.lastProcessedHeight} />
            ) : (
              EMPTY_VALUE_PLACEHOLDER
            )}
          </span>

          <span className="inline-block">of</span>

          <span className="inline-block">
            {data?.targetHeight ? (
              <SlidingNumber number={data.targetHeight} />
            ) : (
              EMPTY_VALUE_PLACEHOLDER
            )}
          </span>

          <span className="items-center hidden sm:flex">
            (<SlidingNumber number={progress} />
            %)
          </span>
        </span>
      </>
    );
  }, [
    isPending,
    error,
    isSynced,
    data?.lastProcessedHeight,
    data?.targetHeight,
    progress,
  ]);

  return (
    <Chip
      color={error ? 'red' : 'dark-grey'}
      className="!bg-opacity-50 normal-case"
    >
      {displayContent}
    </Chip>
  );
};
