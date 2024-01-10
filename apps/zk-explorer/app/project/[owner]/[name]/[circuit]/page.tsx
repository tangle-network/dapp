import { Typography } from '@webb-tools/webb-ui-components';
import { FeedbackCard } from '../../../../../components/FeedbackCard';
import { Header } from '../../../../../components/Header';
import { ProofGenerationStepCards } from '../../../../../components/ProofGenerationStepCards';
import { StepTrackerSidebar } from '../../../../../components/StepTrackerSidebar';

export default function ProofGenerationInitiationPage({
  params,
}: {
  params: { slug: { circuit: string } };
}) {
  // TODO: Handle non-existent circuit.

  return (
    <main className="space-y-6">
      <Header />

      <Typography variant="h4" fw="bold">
        Proof Generation Service
      </Typography>

      <div className="flex gap-6 flex-col md:flex-row">
        <div className="flex flex-col gap-6 md:max-w-[391px]">
          <StepTrackerSidebar />

          <FeedbackCard />
        </div>

        <ProofGenerationStepCards />
      </div>
    </main>
  );
}
