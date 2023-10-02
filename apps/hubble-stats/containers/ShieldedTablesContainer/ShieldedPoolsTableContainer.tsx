import { ShieldedPoolsTable } from '../../components';
import { ShieldedPoolType } from '../../components/ShieldedPoolsTable/types';

export default async function ShieldedPoolsTableContainer({
  pageSize,
  dataFetcher,
}: {
  pageSize: number;
  dataFetcher: () => Promise<ShieldedPoolType[]>;
}) {
  const data = await dataFetcher();

  return <ShieldedPoolsTable data={data} pageSize={pageSize} />;
}
