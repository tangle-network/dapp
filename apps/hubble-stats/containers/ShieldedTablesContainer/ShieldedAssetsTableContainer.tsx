import { ShieldedAssetsTable } from '../../components';
import { ShieldedAssetType } from '../../components/ShieldedAssetsTable/types';

export default function ShieldedAssetsTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: ShieldedAssetType[];
}) {
  return <ShieldedAssetsTable data={value} pageSize={pageSize} />;
}
