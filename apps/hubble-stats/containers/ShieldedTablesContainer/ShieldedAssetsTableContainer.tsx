import { ShieldedAssetsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';

export default async function ShieldedAssetsTableContainer({
  pageSize,
  dataFetcher,
}: {
  pageSize: number;
  dataFetcher: () => Promise<ShieldedAssetType[]>;
}) {
  console.time('ShieldedAssetsTableContainer');
  const data = await dataFetcher();
  console.timeEnd('ShieldedAssetsTableContainer');

  return <ShieldedAssetsTable data={data} pageSize={pageSize} />;
}
