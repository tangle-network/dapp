import Spinner from '@webb-tools/icons/Spinner';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';

export default function Loading() {
  return (
    <AppTemplate.Content className="min-h-[432px] flex items-center justify-center">
      <Spinner size="xl" />
    </AppTemplate.Content>
  );
}
