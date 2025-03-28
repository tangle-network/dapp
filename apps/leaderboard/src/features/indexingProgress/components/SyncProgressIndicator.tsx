import { CrossCircledIcon } from '@radix-ui/react-icons';
import { StatusIndicator } from '@tangle-network/icons';
import { Chip, EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components';
import { useMemo } from 'react';
import { useIndexingProgress } from '../queries';

export const SyncProgressIndicator = () => {
  const { data, error, isPending } = useIndexingProgress();

  const targetBlock =
    data?.targetHeight?.toLocaleString() ?? EMPTY_VALUE_PLACEHOLDER;

  const lastProcessedBlock =
    data?.lastProcessedHeight?.toLocaleString() ?? EMPTY_VALUE_PLACEHOLDER;

  const progress = useMemo(() => {
    if (!data?.lastProcessedHeight || !data?.targetHeight) {
      return 0;
    }

    return (data.lastProcessedHeight / data.targetHeight) * 100;
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
        {isSynced
          ? `Indexing ${lastProcessedBlock} of ${targetBlock}`
          : 'Syncing...'}{' '}
        ({progress.toFixed(2)}%)
      </>
    );
  }, [isPending, error, isSynced, lastProcessedBlock, targetBlock, progress]);

  return (
    <Chip
      color={error ? 'red' : 'dark-grey'}
      className="!bg-opacity-50 normal-case"
    >
      {displayContent}
    </Chip>
  );
};
