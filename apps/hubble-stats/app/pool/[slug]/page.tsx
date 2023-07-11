import {
  PoolMetadataTableContainer,
  PoolTransactionsTableContainer,
} from '../../../containers';

export default function Pool({ params }: { params: { slug: string } }) {
  const poolAddress = params.slug;

  return (
    <div className="py-4 space-y-8">
      <PoolTransactionsTableContainer />
      <PoolMetadataTableContainer />
    </div>
  );
}
