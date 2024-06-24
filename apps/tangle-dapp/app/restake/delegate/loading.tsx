import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';

import TabListItem from '../TabListItem';
import TabsList from '../TabsList';

export default function LoadingPage() {
  return (
    <div className="space-y-4">
      <TabsList>
        <TabListItem>Deposit</TabListItem>
        <TabListItem>Delegate</TabListItem>
      </TabsList>

      <div className="flex flex-col items-center justify-center space-y-3 grow">
        <SkeletonLoader className="h-24" />
      </div>
    </div>
  );
}
