import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import SkeletonLoader from '@webb-tools/webb-ui-components/components/SkeletonLoader';

import TabListItem from './TabListItem';
import TabsList from './TabsList';

const loading = () => {
  return (
    <form className="relative h-full overflow-hidden">
      <div className="flex flex-col h-full space-y-4 grow">
        <TabsList>
          <TabListItem>Deposit</TabListItem>
          <TabListItem>Delegate</TabListItem>
        </TabsList>

        <div className="space-y-2">
          <SkeletonLoader className="h-40" />

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <SkeletonLoader className="h-40" />
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <FeeDetails
            isDefaultOpen
            items={[
              {
                name: 'APY',
                info: 'Restaking Rewards',
                isLoading: true,
              },
              {
                name: 'Withdraw Period',
                info: 'The duration for which the deposited asset is locked.',
                isLoading: true,
              },
            ]}
          />

          <Button isFullWidth isLoading loadingText="Loading..." />
        </div>
      </div>
    </form>
  );
};

export default loading;
