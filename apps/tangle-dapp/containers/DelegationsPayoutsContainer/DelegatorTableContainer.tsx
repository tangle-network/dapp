import { DelegatorTable } from '../../components';
import { Delegator } from '../../types';

export default function DelegatorTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: Delegator[];
}) {
  return <DelegatorTable data={value} pageSize={pageSize} />;
}
