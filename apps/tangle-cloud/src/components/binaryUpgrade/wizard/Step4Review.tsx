import type { FC } from 'react';
import { Button } from '@tangle-network/sandbox-ui/primitives';

import { ZERO_BYTES32, type WizardState } from './types';

/**
 * Step 4: side-by-side review of everything the wizard collected, plus the
 * Publish button. The button is owned by the parent (it wires the tx hook).
 */
interface Step4Props {
  state: WizardState;
  blueprintName?: string;
  blueprintId: bigint;
  /**
   * The next versionId — equal to current binary-version count. Surfaced for
   * the operator's mental model only; the contract assigns it on chain.
   */
  nextVersionId: bigint | null;
  canSubmit: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  txHash: string | null;
  onPublish: () => void;
  onSetActiveFollowUp: () => void;
  canSetActive: boolean;
  settingActive: boolean;
  settingActiveSuccess: boolean;
}

export const Step4Review: FC<Step4Props> = ({
  state,
  blueprintName,
  blueprintId,
  nextVersionId,
  canSubmit,
  isSubmitting,
  isSuccess,
  errorMessage,
  txHash,
  onPublish,
  onSetActiveFollowUp,
  canSetActive,
  settingActive,
  settingActiveSuccess,
}) => {
  const rows: Array<[string, string]> = [
    ['Blueprint', blueprintName ?? `#${blueprintId.toString()}`],
    [
      'Target version',
      nextVersionId !== null
        ? `v${nextVersionId.toString()} (auto-assigned)`
        : 'computing…',
    ],
    ['sha256', state.binaryHash ?? '(missing)'],
    ['Binary URI', state.binaryUri || '(missing)'],
    [
      'Attestation',
      state.attestationHash === ZERO_BYTES32 ? '(none)' : state.attestationHash,
    ],
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-4">
        <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-80 uppercase tracking-wider">
          Review
        </p>
        <dl className="space-y-1.5 text-sm">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="grid grid-cols-[7rem_1fr] gap-2 text-mono-200 dark:text-mono-0"
            >
              <dt className="text-mono-100 dark:text-mono-80 text-xs uppercase tracking-wider">
                {k}
              </dt>
              <dd className="break-all font-mono text-xs">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      {errorMessage && (
        <p className="text-red-500 dark:text-red-400 text-xs">{errorMessage}</p>
      )}
      {txHash && (
        <p className="break-all font-mono text-mono-100 dark:text-mono-80 text-xs">
          Tx hash {txHash}
        </p>
      )}

      {isSuccess ? (
        <div className="space-y-3 rounded-lg border border-success/40 bg-mono-0 dark:bg-mono-180 p-4">
          <p className="font-semibold text-success text-sm">
            Published. v{nextVersionId?.toString() ?? '?'} is now in the
            blueprint timeline.
          </p>
          <p className="text-mono-100 dark:text-mono-80 text-xs">
            Operators on APPROVE policy must ack the new version before their
            services use it. Set it as the active version to make this the
            rollout target.
          </p>
          <Button
            variant="sandbox"
            disabled={!canSetActive || settingActive}
            loading={settingActive}
            onClick={onSetActiveFollowUp}
          >
            {settingActiveSuccess
              ? 'Activated ✓'
              : `Set v${nextVersionId?.toString() ?? '?'} as active`}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-mono-100 dark:text-mono-80 text-xs">
            Publishing calls{' '}
            <code className="font-mono">publishBinaryVersion</code> as the
            blueprint owner.
          </p>
          <Button
            variant="sandbox"
            disabled={!canSubmit || isSubmitting}
            loading={isSubmitting}
            onClick={onPublish}
          >
            Publish
          </Button>
        </div>
      )}
    </div>
  );
};

export default Step4Review;
