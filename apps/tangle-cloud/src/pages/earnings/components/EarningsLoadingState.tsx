import { FC } from 'react';
import {
  Card,
  CardContent,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';

const EarningsLoadingState: FC = () => {
  return (
    <Card variant="sandbox">
      <CardContent className="space-y-3 p-6">
        <Skeleton className="mb-4 h-10 w-64 rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-8 w-11/12 rounded-md" />
        <Skeleton className="h-8 w-10/12 rounded-md" />
      </CardContent>
    </Card>
  );
};

export default EarningsLoadingState;
