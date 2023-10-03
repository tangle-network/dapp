import { ShieldedPoolsTable } from '../../components';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

export default async function ShieldedPoolsTableContainer({
  pageSize,
  dataFetcher,
}: {
  pageSize: number;
  dataFetcher: () => Promise<ShieldedPoolType[]>;
}) {
  console.time('ShieldedPoolsTableContainer');
  const data = await dataFetcher();
  console.timeEnd('ShieldedPoolsTableContainer');

  return <ShieldedPoolsTable data={data} pageSize={pageSize} />;
}
