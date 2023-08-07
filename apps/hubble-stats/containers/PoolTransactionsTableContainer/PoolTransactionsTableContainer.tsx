import PoolTransactionsTableCmp from './PoolTransactionsTableCmp';
import { getPoolTransactionsData } from '../../data';

export default async function PoolTransactionsTableContainer({
  poolAddress,
}: {
  poolAddress: string;
}) {
  const { transactions } = await getPoolTransactionsData(poolAddress);

  return <PoolTransactionsTableCmp transactions={transactions} />;
}
