import { Card } from '@tangle-network/ui-components/components/Card';
import { Progress } from '@tangle-network/ui-components/components/Progress';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { useIndexingProgress } from '../queries/indexingProgress';
import { formatTimeAgo } from '../utils/formatTimeAgo';
import {
  EMPTY_VALUE_PLACEHOLDER,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import { useMemo } from 'react';
import { CheckboxCircleLine } from '@tangle-network/icons';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { twMerge } from 'tailwind-merge';

const IndexingProgressCard = () => {
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

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-red-500">
          <CrossCircledIcon />
          <Typography variant="h5" component="h2" className="font-medium">
            Failed to load indexing progress
          </Typography>
        </div>
        <Typography
          variant="body2"
          className="mt-2 text-mono-100 dark:text-mono-120"
        >
          {error.message || 'An error occurred while fetching the data'}
        </Typography>
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <Typography variant="h5" component="h2" className="font-medium">
          Server Indexing Progress
        </Typography>

        {!isPending && (
          <Typography
            variant="body1"
            component="div"
            className="text-mono-100 dark:text-mono-120"
          >
            Last updated:{' '}
            {data?.lastProcessedTimestamp
              ? formatTimeAgo(new Date(parseInt(data.lastProcessedTimestamp)))
              : EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center text-sm">
          <span>{progress < 100 ? 'Syncing blocks...' : 'Synced'}</span>
          {isPending ? (
            <SkeletonLoader as="span" size="md" className="max-w-12" />
          ) : (
            <span>{progress.toFixed(0)}%</span>
          )}
        </div>

        {isPending ? (
          <SkeletonLoader className="h-2 w-full" />
        ) : (
          <Progress value={progress} max={100} className="h-2" />
        )}
      </div>

      <div className="flex justify-between items-center">
        <Typography
          variant="body2"
          className="text-mono-100 dark:text-mono-120"
        >
          {isPending ? (
            <SkeletonLoader as="span" size="lg" />
          ) : (
            `Indexing block ${lastProcessedBlock} of ${targetBlock}`
          )}
        </Typography>

        {!isPending && (
          <Typography
            variant="body2"
            className={twMerge(
              data?.indexerHealthy ? '!text-green-500' : '!text-red-500',
              'flex items-center gap-1',
            )}
          >
            {data?.indexerHealthy ? (
              <>
                <CheckboxCircleLine className="fill-current dark:fill-current" />
                Indexer Healthy
              </>
            ) : (
              <>
                <CrossCircledIcon />
                Indexer Unhealthy
              </>
            )}
          </Typography>
        )}
      </div>
    </Card>
  );
};

export default IndexingProgressCard;
