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
          <PoolOverviewContainer />
        </div>
        <div className="flex-grow"></div>
      </div>

      <NetworkTablesContainer />

      <PoolTransactionsTableContainer />

      <PoolMetadataTableContainer />
    </div>
  );
}
