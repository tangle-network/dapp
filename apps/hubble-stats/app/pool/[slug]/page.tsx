import {
  NetworkTableContainer,
  PoolMetadataTableContainer,
  PoolOverviewContainer,
  PoolTransactionsTableContainer,
} from '../../../containers';

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  return (
    <div className="py-4 space-y-8">

      <div className="flex gap-4">
        <div className="w-[400px]">
          <PoolOverviewContainer />
        </div>
        <div className="flex-grow"></div>
      </div>
      
      <NetworkTableContainer />

      <PoolTransactionsTableContainer />
      <PoolMetadataTableContainer />
    </div>
  );
}
