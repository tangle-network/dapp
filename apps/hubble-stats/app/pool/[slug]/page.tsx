import { notFound } from 'next/navigation';

import { Suspense } from 'react';
import { VANCHORS_MAP } from '../../../constants';
import {
  PoolInfoCardContainer,
  PoolMetadataTableContainer,
  PoolOverviewChartsContainer,
  PoolOverviewTableContainer,
  PoolTransactionsTableContainer,
  PoolWrappingChartsContainer,
  PoolWrappingTableContainer,
} from '../../../containers';
import { getDateDataForPage } from '../../../utils';
import { Suspense } from 'react';

// revalidate every 5 seconds
export const revalidate = 5;

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  // if poolAddress slug is not valid, return 404
  if (!VANCHORS_MAP[poolAddress]) {
    notFound();
  }

  const { epochStart, epochNow, numDatesFromStart } = getDateDataForPage();

  const chartProps = {
    poolAddress,
    numDatesFromStart,
    startingEpoch: epochStart,
    epochNow,
  };

  const tableProps = {
    poolAddress,
    epochNow,
    availableTypedChainIds: VANCHORS_MAP[poolAddress].supportedChains,
  };

  return (
    <div className="py-4 space-y-8">
      <div className="grid grid-cols-1 items-end lg:grid-cols-[auto_minmax(0,_1fr)_minmax(0,_1fr)] gap-4">
        <PoolInfoCardContainer
          poolAddress={poolAddress}
          epochStart={epochStart}
          epochNow={epochNow}
        />
        <PoolOverviewChartsContainer {...chartProps} />
        <PoolWrappingChartsContainer {...chartProps} />
      </div>

      <div className="space-y-12">
        <PoolOverviewTableContainer {...tableProps} />
        <PoolWrappingTableContainer {...tableProps} />
      </div>

      <PoolTransactionsTableContainer poolAddress={poolAddress} />

      <Suspense>
        <PoolMetadataTableContainer poolAddress={poolAddress} />
      </Suspense>
    </div>
  );
}
