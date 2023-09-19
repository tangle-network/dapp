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
    <div className="py-4 space-y-8">
      <div className="grid grid-cols-1 items-end lg:grid-cols-[auto_minmax(0,_1fr)_minmax(0,_1fr)] gap-4">
        {/* TypeScript doesn't understand async components. */}
        {/* Current approach: https://github.com/vercel/next.js/issues/42292#issuecomment-1298459024 */}
        {/* @ts-expect-error Server Component */}
        <PoolOverviewCardContainer poolAddress={poolAddress} />

        {/* @ts-expect-error Server Component */}
        <PoolOverviewChartsContainer poolAddress={poolAddress} />

        {/* @ts-expect-error Server Component */}
        <PoolWrappingChartsContainer poolAddress={poolAddress} />
      </div>

      <div className="space-y-12">
        {/* @ts-expect-error Server Component */}
        <PoolOverviewTableContainer poolAddress={poolAddress} />

        {/* @ts-expect-error Server Component */}
        <PoolWrappingTableContainer poolAddress={poolAddress} />
      </div>

      {/* @ts-expect-error Server Component */}
      <PoolTransactionsTableContainer poolAddress={poolAddress} />

      {/* @ts-expect-error Server Component */}
      <PoolMetadataTableContainer poolAddress={poolAddress} />
    </div>
  );
}
