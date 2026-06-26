import { FC } from 'react';
import { ProofStage, type ProofProgress } from '../../types/shielded';

type Props = {
  progress: ProofProgress;
};

const STAGE_LABELS: Record<ProofStage, string> = {
  [ProofStage.IDLE]: 'Ready',
  [ProofStage.FETCHING_ARTIFACTS]: 'Downloading circuit artifacts...',
  [ProofStage.SYNCING_LEAVES]: 'Syncing Merkle tree leaves...',
  [ProofStage.BUILDING_WITNESS]: 'Building witness inputs...',
  [ProofStage.GENERATING_PROOF]: 'Generating ZK proof...',
  [ProofStage.SENDING_TX]: 'Sending transaction...',
  [ProofStage.DONE]: 'Complete',
  [ProofStage.ERROR]: 'Error',
};

const STAGE_ORDER = [
  ProofStage.FETCHING_ARTIFACTS,
  ProofStage.SYNCING_LEAVES,
  ProofStage.BUILDING_WITNESS,
  ProofStage.GENERATING_PROOF,
  ProofStage.SENDING_TX,
];

const ProofProgressIndicator: FC<Props> = ({ progress }) => {
  const currentIndex = STAGE_ORDER.indexOf(progress.stage);
  const isActive =
    progress.stage !== ProofStage.IDLE &&
    progress.stage !== ProofStage.DONE &&
    progress.stage !== ProofStage.ERROR;

  if (progress.stage === ProofStage.IDLE) {
    return null;
  }

  return (
    <div className="p-4 space-y-3 border rounded-lg border-mono-60 dark:border-mono-170">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-mono-200 dark:text-mono-0">
          {STAGE_LABELS[progress.stage]}
        </span>

        {isActive && (
          <div className="w-4 h-4 border-2 rounded-full animate-spin border-purple-40 border-t-transparent" />
        )}

        {progress.stage === ProofStage.DONE && (
          <span className="text-sm text-green-70 dark:text-green-50">✓</span>
        )}

        {progress.stage === ProofStage.ERROR && (
          <span className="text-sm text-red-70 dark:text-red-50">✗</span>
        )}
      </div>

      {isActive && (
        <div className="flex gap-1">
          {STAGE_ORDER.map((stage, i) => (
            <div
              key={stage}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < currentIndex
                  ? 'bg-purple-40'
                  : i === currentIndex
                    ? 'bg-purple-40 animate-pulse'
                    : 'bg-mono-20 dark:bg-mono-190'
              }`}
            />
          ))}
        </div>
      )}

      {progress.message && (
        <p className="text-xs text-mono-100 dark:text-mono-80">
          {progress.message}
        </p>
      )}
    </div>
  );
};

export default ProofProgressIndicator;
