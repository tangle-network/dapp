import { notFound } from 'next/navigation';

import {
  PoolOverviewCardContainer,
  PoolOverviewChartsContainer,
  PoolWrappingChartsContainer,
  PoolTransactionsTableContainer,
  PoolOverviewTableContainer,
  PoolWrappingTableContainer,
  PoolMetadataTableContainer,
} from '../../../containers';
import { VANCHORS_MAP, ACTIVE_CHAINS } from '../../../constants';
import {
  getEpochStart,
  getEpochNow,
  getNumDatesFromStart,
} from '../../../utils';

// revalidate every 5 seconds
export const revalidate = 5;

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  // if poolAddress slug is not valid, return 404
  if (!VANCHORS_MAP[poolAddress]) {
    notFound();
  }

  const chartProps = {
    poolAddress,
    numDatesFromStart: getNumDatesFromStart(),
    startingEpoch: getEpochStart(),
  };

  const tableProps = {
    poolAddress,
    epochNow: getEpochNow(),
    availableTypedChainIds: ACTIVE_CHAINS,
  };

  return (
    <div className="py-4 space-y-8">
      <div className="grid grid-cols-1 items-end lg:grid-cols-[auto_minmax(0,_1fr)_minmax(0,_1fr)] gap-4">
        {/* <PoolOverviewCardContainer poolAddress={poolAddress} /> */}
        <PoolOverviewChartsContainer {...chartProps} />
        <PoolWrappingChartsContainer {...chartProps} />
      </div>

      <div className="space-y-12">
        <PoolOverviewTableContainer {...tableProps} />
        <PoolWrappingTableContainer {...tableProps} />
      </div>

      {/* <PoolTransactionsTableContainer poolAddress={poolAddress} />
      <PoolMetadataTableContainer poolAddress={poolAddress} /> */}
    </div>
  );
}
