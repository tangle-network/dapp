import { ValidatorTable } from '../../components';
import { Validator } from '../../types';

export default function ValidatorTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: Validator[];
}) {
  return <ValidatorTable data={value} pageSize={pageSize} />;
}
