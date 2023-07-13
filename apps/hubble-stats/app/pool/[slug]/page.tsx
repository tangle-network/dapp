import {
  PoolMetadataTableContainer,
  PoolOverviewContainer,
  PoolTransactionsTableContainer,
} from '../../../containers';

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  return (
    <div className="py-4 space-y-8">
      <div className="flex gap-4">
        <div className="flex-[1]">
          <PoolOverviewContainer />
        </div>
        <div className="flex-[2]"></div>
      </div>
      <PoolTransactionsTableContainer />
      <PoolMetadataTableContainer />
    </div>
  );
}
