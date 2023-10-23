import { ShieldedPoolsTable } from '../../components';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

export default function ShieldedPoolsTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: ShieldedPoolType[];
}) {
  return <ShieldedPoolsTable data={value} pageSize={pageSize} />;
}
