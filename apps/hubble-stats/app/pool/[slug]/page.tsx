import {
  NetworkTablesContainer,
  PoolMetadataTableContainer,
  PoolOverviewContainer,
  PoolTransactionsTableContainer,
} from '../../../containers';

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  return (
    <div className="py-4 space-y-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-[400px]">
          {/* TypeScript doesn't understand async components. */}
          {/* Current approach: https://github.com/vercel/next.js/issues/42292#issuecomment-1298459024 */}
          {/* @ts-expect-error Server Component */}
          <PoolOverviewContainer poolAddress={poolAddress} />
        </div>
        <div className="flex-grow"></div>
      </div>

      {/* @ts-expect-error Server Component */}
      <NetworkTablesContainer poolAddress={poolAddress} />

      <PoolTransactionsTableContainer />

      {/* @ts-expect-error Server Component */}
      <PoolMetadataTableContainer poolAddress={poolAddress} />
    </div>
  );
}
