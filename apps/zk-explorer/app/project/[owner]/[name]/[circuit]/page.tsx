import { Typography } from '@webb-tools/webb-ui-components';
import Header from '../../../../../components/Header';
import StepTrackerSidebarAndCards from './components/StepTrackerSidebarAndCards';

export default function ProofGenerationInitiationPage({
  params,
}: {
  params: { circuit: string };
}) {
  // TODO: Handle non-existent circuit or missing/invalid circuit slug.

  return (
    <main className="space-y-6">
      <Header />

      <Typography variant="h4" fw="bold">
        Proof Generation Service
      </Typography>

      <StepTrackerSidebarAndCards circuitFilename={params.circuit} />
    </main>
  );
}
