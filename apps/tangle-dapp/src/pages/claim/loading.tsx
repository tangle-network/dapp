import { Spinner } from '@webb-tools/icons';
import { AppTemplate } from '@webb-tools/webb-ui-components/containers/AppTemplate';

// Using Suspense does not improve page performance => need to use loading.tsx
// Change this to spinner because loading screen on success page is also applied from this file
export default function Loading() {
  return (
    <AppTemplate.Content className="min-h-[432px] flex items-center justify-center">
      <Spinner size="xl" />
    </AppTemplate.Content>
  );
}
