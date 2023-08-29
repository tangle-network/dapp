import { notFound } from 'next/navigation';

import {
  NetworkTablesContainer,
  PoolChartsContainer,
  PoolMetadataTableContainer,
  PoolOverviewContainer,
  PoolTransactionsTableContainer,
} from '../../../containers';
import { VANCHORS_MAP } from '../../../constants';

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  if (!VANCHORS_MAP[poolAddress]) {
    notFound();
  }

  return (
    <div className="py-4 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[400px_minmax(0,_1fr)] gap-4">
        <div className="self-end">
          {/* TypeScript doesn't understand async components. */}
          {/* Current approach: https://github.com/vercel/next.js/issues/42292#issuecomment-1298459024 */}
          {/* @ts-expect-error Server Component */}
          <PoolOverviewContainer poolAddress={poolAddress} />
        </div>
        {/* @ts-expect-error Server Component */}
        <PoolChartsContainer poolAddress={poolAddress} />
      </div>

      {/* @ts-expect-error Server Component */}
      <NetworkTablesContainer poolAddress={poolAddress} />

      {/* @ts-expect-error Server Component */}
      <PoolTransactionsTableContainer poolAddress={poolAddress} />

      {/* @ts-expect-error Server Component */}
      <PoolMetadataTableContainer poolAddress={poolAddress} />
    </div>
  );
}
