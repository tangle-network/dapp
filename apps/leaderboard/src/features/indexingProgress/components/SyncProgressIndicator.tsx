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

  const displayContent = useMemo(() => {
    if (isPending) {
      return (
        <>
          <StatusIndicator variant="info" animated />
          Loading indexer activity...
        </>
      );
    }

    if (error) {
      return (
        <>
          <CrossCircledIcon className="text-red-500" />
          Indexer status unavailable
        </>
      );
    }

    if (!data) {
      return (
        <>
          <StatusIndicator variant="warning" />
          No indexer metadata
        </>
      );
    }

    return (
      <>
        <StatusIndicator variant="info" animated />
        <span className="flex items-center gap-1">
          Indexed block
          <span className="inline-block">
            <SlidingNumber number={data.latestProcessedBlock} />
          </span>
          <span className="items-center hidden sm:flex">
            ({' '}
            {data.numEventsProcessed > 0 ? (
              <SlidingNumber number={data.numEventsProcessed} />
            ) : (
              EMPTY_VALUE_PLACEHOLDER
            )}{' '}
            events)
          </span>
        </span>
      </>
    );
  }, [isPending, error, data]);

  return (
    <Chip
      color={error ? 'red' : 'dark-grey'}
      className="!bg-opacity-50 normal-case"
    >
      {displayContent}
    </Chip>
  );
};
