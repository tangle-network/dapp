import {
  type ChangeEvent,
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@tangle-network/sandbox-ui/primitives';
import { useChainId, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import type { Hex } from 'viem';

import {
  usePublishBinaryVersionTx,
  useSetActiveBinaryVersionTx,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx';
import { fetchBinaryVersions } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';

import { Stepper } from './wizard/Stepper';
import { Step1Binary } from './wizard/Step1Binary';
import { Step2Hosting } from './wizard/Step2Hosting';
import { Step3Attestation } from './wizard/Step3Attestation';
import { Step4Review } from './wizard/Step4Review';
import { Step5Notify } from './wizard/Step5Notify';
import {
  ZERO_BYTES32,
  initialWizardState,
  isPlausibleBinaryUri,
  type WizardState,
  type WizardStepId,
} from './wizard/types';
import { envWeb3StorageToken, readSessionToken } from './wizard/web3Storage';
import { sha256OfFile } from './wizard/hashing';

/**
 * Owner-only publish dialog. Two modes:
 *
 *   - `mode="wizard"` (default): multi-step UX walking the publisher through
 *     binary → hosting → attestation → review → notify. The chain calls only
 *     fire from step 4 (publish) and the optional set-active follow-up.
 *
 *   - `mode="simple"`: the original single-form dialog. Existing call sites
 *     that pass `mode="simple"` get the legacy behavior with zero changes.
 *
 * Invariants both modes share:
 *   - sha256 is computed from the literal bytes the operator commits — we
 *     never accept a user-typed hash AND a file at the same time. Step 1's
 *     mode toggle enforces that.
 *   - The dialog never auto-closes after publish. The operator must dismiss.
 *   - We invalidate the version list on success via the tx hook's onSuccess.
 */

interface PublishVersionDialogProps {
  blueprintId: bigint;
  blueprintName?: string;
  onClose: () => void;
  mode?: 'wizard' | 'simple';
}

export const PublishVersionDialog: FC<PublishVersionDialogProps> = ({
  blueprintId,
  blueprintName,
  onClose,
  mode = 'wizard',
}) => {
  if (mode === 'simple') {
    return (
      <SimplePublishDialog
        blueprintId={blueprintId}
        blueprintName={blueprintName}
        onClose={onClose}
      />
    );
  }
  return (
    <WizardPublishDialog
      blueprintId={blueprintId}
      blueprintName={blueprintName}
      onClose={onClose}
    />
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Wizard mode
// ──────────────────────────────────────────────────────────────────────────

const WizardPublishDialog: FC<{
  blueprintId: bigint;
  blueprintName?: string;
  onClose: () => void;
}> = ({ blueprintId, blueprintName, onClose }) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const [state, setState] = useState<WizardState>(() => ({
    ...initialWizardState(),
    web3StorageToken: readSessionToken() || envWeb3StorageToken(),
  }));
  const [currentStep, setCurrentStep] = useState<WizardStepId>(1);
  const [furthestStep, setFurthestStep] = useState<WizardStepId>(1);

  // Pre-publish: read current binary-version count to surface the would-be
  // next version id in the review screen. This is a UX-only number — the
  // contract assigns the actual id on publish.
  const { data: existingCount } = useQuery({
    queryKey: ['tangle', 'pre-publish-count', chainId, blueprintId.toString()],
    queryFn: async () => {
      if (!publicClient) return null;
      const versions = await fetchBinaryVersions(
        publicClient,
        chainId,
        blueprintId,
      );
      return BigInt(versions.length);
    },
    enabled: publicClient !== undefined,
    staleTime: 0,
  });
  const nextVersionId = existingCount ?? null;

  const {
    execute: publishExecute,
    isPending: publishing,
    error: publishError,
    txHash: publishTxHash,
    isSuccess: publishSuccess,
    reset: resetPublish,
  } = usePublishBinaryVersionTx();

  const {
    execute: setActiveExecute,
    isPending: settingActive,
    isSuccess: setActiveSuccess,
  } = useSetActiveBinaryVersionTx();

  const advance = useCallback((target: WizardStepId) => {
    setCurrentStep(target);
    setFurthestStep((prev) => (target > prev ? target : prev));
  }, []);

  // Bump furthest step whenever success lands so the operator can reach the
  // notify step.
  useEffect(() => {
    if (publishSuccess && furthestStep < 5) {
      queueMicrotask(() => {
        setFurthestStep(5);
      });
    }
  }, [publishSuccess, furthestStep]);

  const step1Complete = state.binaryHash !== null && !state.isHashing;
  const step2Complete = isPlausibleBinaryUri(state.binaryUri);
  const step3Complete = true; // attestation is optional by design

  const canSubmit =
    step1Complete && step2Complete && publishExecute !== null && !publishing;

  const handlePublish = useCallback(async () => {
    if (!publishExecute) return;
    if (state.binaryHash === null) return;
    await publishExecute({
      blueprintId,
      sha256Hash: state.binaryHash,
      binaryUri: state.binaryUri.trim(),
      attestationHash: state.attestationHash,
    });
  }, [
    publishExecute,
    state.binaryHash,
    state.binaryUri,
    state.attestationHash,
    blueprintId,
  ]);

  const handleSetActive = useCallback(async () => {
    if (!setActiveExecute) return;
    if (nextVersionId === null) return;
    await setActiveExecute({ blueprintId, versionId: nextVersionId });
  }, [setActiveExecute, blueprintId, nextVersionId]);

  const handleDismiss = useCallback(() => {
    resetPublish();
    onClose();
  }, [resetPublish, onClose]);

  const handleNext = useCallback(() => {
    const target = Math.min(5, currentStep + 1) as WizardStepId;
    advance(target);
  }, [currentStep, advance]);

  const handleBack = useCallback(() => {
    if (currentStep <= 1) return;
    setCurrentStep((s) => (s - 1) as WizardStepId);
  }, [currentStep]);

  // Gate each "Next" press on the relevant slice of state.
  const canAdvanceFromCurrent =
    (currentStep === 1 && step1Complete) ||
    (currentStep === 2 && step2Complete) ||
    (currentStep === 3 && step3Complete) ||
    (currentStep === 4 && publishSuccess) ||
    currentStep === 5;

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && handleDismiss()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Publish binary version
            {blueprintName ? ` · ${blueprintName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Append a new build to blueprint #{blueprintId.toString()}. The
            sha256 is computed locally; on-chain calls only fire in step 4.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <Stepper
            currentStep={currentStep}
            furthestStep={furthestStep}
            onJump={(s) => setCurrentStep(s)}
          />
        </div>

        <div className="mt-4 min-h-[16rem]">
          {currentStep === 1 && (
            <Step1Binary state={state} setState={setState} />
          )}
          {currentStep === 2 && (
            <Step2Hosting state={state} setState={setState} />
          )}
          {currentStep === 3 && (
            <Step3Attestation state={state} setState={setState} />
          )}
          {currentStep === 4 && (
            <Step4Review
              state={state}
              blueprintId={blueprintId}
              blueprintName={blueprintName}
              nextVersionId={nextVersionId}
              canSubmit={canSubmit}
              isSubmitting={publishing}
              isSuccess={publishSuccess}
              errorMessage={
                publishError ? `Publish failed: ${publishError.message}` : null
              }
              txHash={publishTxHash ?? null}
              onPublish={() => void handlePublish()}
              onSetActiveFollowUp={() => void handleSetActive()}
              canSetActive={
                setActiveExecute !== null &&
                publishSuccess &&
                nextVersionId !== null
              }
              settingActive={settingActive}
              settingActiveSuccess={setActiveSuccess}
            />
          )}
          {currentStep === 5 && (
            <Step5Notify
              state={state}
              blueprintId={blueprintId}
              blueprintName={blueprintName}
              publishedVersionId={nextVersionId}
              servicesPath={`/blueprints/${blueprintId.toString()}`}
            />
          )}
        </div>

        <footer className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={currentStep === 1}
            onClick={handleBack}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleDismiss}>
              {publishSuccess ? 'Close' : 'Cancel'}
            </Button>
            {currentStep < 5 && (
              <Button
                variant="sandbox"
                disabled={!canAdvanceFromCurrent}
                onClick={handleNext}
              >
                {currentStep === 4
                  ? publishSuccess
                    ? 'Notify operators →'
                    : 'Publish to advance'
                  : 'Next'}
              </Button>
            )}
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

// ──────────────────────────────────────────────────────────────────────────
// Simple (legacy) mode
// ──────────────────────────────────────────────────────────────────────────

const SimplePublishDialog: FC<{
  blueprintId: bigint;
  blueprintName?: string;
  onClose: () => void;
}> = ({ blueprintId, blueprintName, onClose }) => {
  const [binaryFile, setBinaryFile] = useState<File | null>(null);
  const [binaryHash, setBinaryHash] = useState<Hex | null>(null);
  const [binaryUri, setBinaryUri] = useState('');
  const [attestationFile, setAttestationFile] = useState<File | null>(null);
  const [attestationHash, setAttestationHash] = useState<Hex>(ZERO_BYTES32);
  const [isHashing, setIsHashing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { execute, isPending, error, txHash, isSuccess, reset } =
    usePublishBinaryVersionTx();

  const handleBinaryFile = useCallback(async (file: File | null) => {
    setBinaryFile(file);
    setBinaryHash(null);
    if (file === null) return;
    setIsHashing(true);
    try {
      const hash = await sha256OfFile(file);
      setBinaryHash(hash);
    } finally {
      setIsHashing(false);
    }
  }, []);

  const handleAttestationFile = useCallback(async (file: File | null) => {
    setAttestationFile(file);
    if (file === null) {
      setAttestationHash(ZERO_BYTES32);
      return;
    }
    const hash = await sha256OfFile(file);
    setAttestationHash(hash);
  }, []);

  const canSubmit = useMemo(() => {
    if (isPending || isHashing) return false;
    if (binaryHash === null) return false;
    if (binaryUri.trim().length === 0) return false;
    return true;
  }, [isPending, isHashing, binaryHash, binaryUri]);

  const handleSubmit = useCallback(async () => {
    if (!execute) {
      setValidationError('Connect a wallet to publish a binary version.');
      return;
    }
    if (binaryHash === null) {
      setValidationError('Upload a binary file to compute its sha256 hash.');
      return;
    }
    const trimmedUri = binaryUri.trim();
    if (trimmedUri.length === 0) {
      setValidationError('Provide an IPFS or HTTPS URI for the binary.');
      return;
    }
    setValidationError(null);
    await execute({
      blueprintId,
      sha256Hash: binaryHash,
      binaryUri: trimmedUri,
      attestationHash,
    });
  }, [execute, binaryHash, binaryUri, attestationHash, blueprintId]);

  const handleDismiss = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && handleDismiss()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Publish binary version
            {blueprintName ? ` · ${blueprintName}` : ''}
          </DialogTitle>
          <DialogDescription>
            Append a new build to blueprint #{blueprintId.toString()}. The
            file&apos;s sha256 is computed locally before submission.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="binary-file">Binary</Label>
            <Input
              id="binary-file"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files?.[0] ?? null;
                void handleBinaryFile(file);
              }}
            />
            {binaryFile && (
              <p className="text-mono-120 dark:text-mono-100 text-xs">
                {binaryFile.name} · {(binaryFile.size / 1024).toFixed(1)} KB
              </p>
            )}
            <p className="break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
              sha256{' '}
              {isHashing
                ? 'hashing…'
                : (binaryHash ?? 'upload a file to compute hash')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="binary-uri">Binary URL</Label>
            <Input
              id="binary-uri"
              placeholder="ipfs://… or https://…"
              value={binaryUri}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setBinaryUri(e.currentTarget.value)
              }
            />
            <p className="text-mono-120 dark:text-mono-100 text-xs">
              The contract stores this URI as-is. Pinning is off-chain; upload
              the file to your pinning provider first, then paste the resulting
              URI here.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="attestation-file">
              Attestation bundle (optional)
            </Label>
            <Input
              id="attestation-file"
              type="file"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const file = e.currentTarget.files?.[0] ?? null;
                void handleAttestationFile(file);
              }}
            />
            {attestationFile && (
              <p className="break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
                sha256 {attestationHash}
              </p>
            )}
            <p className="text-mono-120 dark:text-mono-100 text-xs">
              Optional SLSA / sigstore bundle digest. Leave blank for an
              all-zero sentinel.
            </p>
          </div>

          {validationError && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              {validationError}
            </p>
          )}
          {error && (
            <p className="text-red-500 dark:text-red-400 text-xs">
              Publish failed: {error.message}
            </p>
          )}
          {txHash && (
            <p className="break-all font-mono text-mono-120 dark:text-mono-100 text-xs">
              Tx hash {txHash}
            </p>
          )}
          {isSuccess && (
            <p className="text-success text-xs">
              Published. The new version appears in the timeline above.
            </p>
          )}
        </div>

        <footer className="mt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={handleDismiss}>
            {isSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!isSuccess && (
            <Button
              variant="sandbox"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={isPending}
            >
              Publish
            </Button>
          )}
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default PublishVersionDialog;
