import { ShieldedAssetsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';

export default async function ShieldedAssetsTableContainer({
  pageSize,
  dataFetcher,
}: {
  pageSize: number;
  dataFetcher: () => Promise<ShieldedAssetType[]>;
}) {
  const data = await dataFetcher();

  return <ShieldedAssetsTable data={data} pageSize={pageSize} />;
}
