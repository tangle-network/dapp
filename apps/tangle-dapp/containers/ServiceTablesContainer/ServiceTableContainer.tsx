import { ServiceTable } from '../../components';
import { Service } from '../../types';

export default function ServiceTableContainer({
  pageSize,
  value,
}: {
  pageSize: number;
  value: Service[];
}) {
  return <ServiceTable data={value} pageSize={pageSize} />;
}
