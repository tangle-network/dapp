import { PayoutTable } from '../../components';
import { Payout } from '../../types';

export default function PayoutTableContainer({
  pageSize,
  value,
  updateValue,
}: {
  pageSize: number;
  value: Payout[];
  updateValue: (value: Payout[]) => void;
}) {
  return (
    <PayoutTable data={value} pageSize={pageSize} updateData={updateValue} />
  );
}
