import { Suspense } from 'react';
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
import { LoadingScreen } from '../../../components';
import { VANCHORS_MAP } from '../../../constants';

// revalidate every 5 seconds
export const revalidate = 5;

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  // if poolAddress slug is not valid, return 404
  if (!VANCHORS_MAP[poolAddress]) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="py-4 space-y-8">
        <div className="grid grid-cols-1 items-end lg:grid-cols-[auto_minmax(0,_1fr)_minmax(0,_1fr)] gap-4">
          <PoolOverviewCardContainer poolAddress={poolAddress} />
          <PoolOverviewChartsContainer poolAddress={poolAddress} />
          <PoolWrappingChartsContainer poolAddress={poolAddress} />
        </div>

        <div className="space-y-12">
          <PoolOverviewTableContainer poolAddress={poolAddress} />
          <PoolWrappingTableContainer poolAddress={poolAddress} />
        </div>

        <PoolTransactionsTableContainer poolAddress={poolAddress} />
        <PoolMetadataTableContainer poolAddress={poolAddress} />
      </div>
    </Suspense>
  );
}
