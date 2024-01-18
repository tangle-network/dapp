import { PayoutTable } from '../../components';
import { Payout } from '../../types';

export default function PayoutTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: Payout[];
}) {
  return <PayoutTable data={value} pageSize={pageSize} />;
}
