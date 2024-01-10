import { Typography } from '@webb-tools/webb-ui-components';
import { Header } from '../../../../../components/Header';
import { ProofGenerationInteractiveContents } from '../../../../../components/ProofGenerationInteractiveContents';

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

      <ProofGenerationInteractiveContents />
    </main>
  );
}
