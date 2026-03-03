import { FC, useCallback, useEffect, useState, type ChangeEvent } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import {
  usePodInfo,
  useStartCheckpoint,
  useVerifyCheckpointProofs,
} from '../hooks';
import { CheckpointProofBundle, gweiToEth } from '../types';

interface CheckpointCardProps {
  podAddress: Address;
}

const isHexString = (value: unknown): value is `0x${string}` =>
  typeof value === 'string' && value.startsWith('0x') && value.length > 2;

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCheckpointProofBundle = (
  value: unknown,
): value is CheckpointProofBundle => {
  if (!isObjectRecord(value)) return false;

  const { stateRootProof, balanceContainerProof, proofs } = value;
  if (
    !isObjectRecord(stateRootProof) ||
    !isHexString(stateRootProof.beaconStateRoot) ||
    !isHexString(stateRootProof.proof)
  ) {
    return false;
  }

  if (
    !isObjectRecord(balanceContainerProof) ||
    !isHexString(balanceContainerProof.balanceContainerRoot) ||
    !isHexString(balanceContainerProof.proof)
  ) {
    return false;
  }

  if (!Array.isArray(proofs) || proofs.length === 0) return false;

  return proofs.every(
    (proof) =>
      isObjectRecord(proof) &&
      isHexString(proof.pubkeyHash) &&
      isHexString(proof.balanceRoot) &&
      isHexString(proof.proof),
  );
};

const CheckpointCard: FC<CheckpointCardProps> = ({ podAddress }) => {
  const { data: podInfo, isLoading, refetch } = usePodInfo(podAddress);
  const {
    startCheckpoint,
    isPending: isStartingCheckpoint,
    isConfirming: isConfirmingStart,
    isSuccess: isStartSuccess,
    error: startError,
  } = useStartCheckpoint(podAddress);
  const {
    verifyCheckpointProofs,
    isPending: isSubmittingProofs,
    isConfirming: isConfirmingProofs,
    isSuccess: isProofSubmissionSuccess,
    error: proofSubmissionError,
  } = useVerifyCheckpointProofs(podAddress);
  const [revertIfNoBalance, setRevertIfNoBalance] = useState(false);
  const [proofJson, setProofJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleStartCheckpoint = () => {
    startCheckpoint(revertIfNoBalance);
  };

  const handleFileUpload = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const content = loadEvent.target?.result;
        if (typeof content !== 'string') {
          setParseError('Failed to parse uploaded file content.');
          return;
        }

        setProofJson(content);
        setParseError(null);
      };
      reader.onerror = () => {
        setParseError('Failed to read uploaded file.');
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleSubmitProofs = useCallback(() => {
    if (!proofJson.trim()) {
      setParseError('Upload or paste a checkpoint proof bundle first.');
      return;
    }

    try {
      const parsedJson: unknown = JSON.parse(proofJson);
      if (!isCheckpointProofBundle(parsedJson)) {
        setParseError(
          'Invalid proof bundle format. Expected stateRootProof, balanceContainerProof, and proofs[].',
        );
        return;
      }

      setParseError(null);
      verifyCheckpointProofs(parsedJson);
    } catch {
      setParseError('Invalid JSON format.');
    }
  }, [proofJson, verifyCheckpointProofs]);

  useEffect(() => {
    if (!isStartSuccess && !isProofSubmissionSuccess) return;

    const timeoutId = setTimeout(() => {
      void refetch();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isStartSuccess, isProofSubmissionSuccess, refetch]);

  if (isLoading || !podInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Checkpoint Management
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading checkpoint information...
        </Typography>
      </Card>
    );
  }

  const canStartCheckpoint =
    !podInfo.checkpointActive && podInfo.activeValidatorCount > 0;

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Checkpoint Management
      </Typography>

      {podInfo.checkpointActive && podInfo.currentCheckpoint ? (
        // Active checkpoint view
        <div className="space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
            <Typography
              variant="body1"
              fw="bold"
              className="text-blue-700 dark:text-blue-300 mb-2"
            >
              Checkpoint In Progress
            </Typography>
            <Typography
              variant="body2"
              className="text-blue-600 dark:text-blue-400"
            >
              Submit checkpoint proofs to finalize the checkpoint.
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-80"
              >
                Proofs Remaining
              </Typography>
              <Typography variant="h5" fw="bold">
                {podInfo.currentCheckpoint.proofsRemaining} /{' '}
                {podInfo.activeValidatorCount}
              </Typography>
            </div>
            <div>
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-80"
              >
                Balance Delta
              </Typography>
              <Typography
                variant="h5"
                fw="bold"
                className={
                  podInfo.currentCheckpoint.balanceDeltasGwei < BigInt(0)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }
              >
                {podInfo.currentCheckpoint.balanceDeltasGwei >= BigInt(0)
                  ? '+'
                  : ''}
                {gweiToEth(podInfo.currentCheckpoint.balanceDeltasGwei)} ETH
              </Typography>
            </div>
          </div>

          <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg space-y-2">
            <Typography variant="body2" fw="bold">
              How to submit checkpoint proofs:
            </Typography>
            <ol className="list-decimal list-inside text-sm text-mono-120 dark:text-mono-80 space-y-1">
              <li>
                Run:{' '}
                <code className="bg-mono-40 dark:bg-mono-140 px-1 rounded">
                  tanglepod-cli checkpoint --pod {podAddress.slice(0, 10)}...
                </code>
              </li>
              <li>Upload the generated JSON proof bundle</li>
              <li>Submit the proofs to complete the checkpoint</li>
            </ol>
          </div>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Upload Proof Bundle
            </Typography>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="block w-full text-sm text-mono-120 dark:text-mono-80
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                dark:file:bg-blue-900/30 dark:file:text-blue-300
                hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50
                cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <Typography variant="body2" className="text-mono-100">
              Or paste JSON directly:
            </Typography>
            <textarea
              value={proofJson}
              onChange={(event) => {
                setProofJson(event.target.value);
                setParseError(null);
              }}
              placeholder='{"stateRootProof": {...}, "balanceContainerProof": {...}, "proofs": [...]}'
              className="w-full h-32 p-3 text-sm font-mono rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {parseError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">{parseError}</Typography>
            </div>
          )}

          {proofSubmissionError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error:{' '}
                {proofSubmissionError.message ||
                  'Failed to submit checkpoint proofs'}
              </Typography>
            </div>
          )}

          {isProofSubmissionSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">
                Checkpoint proofs submitted successfully.
              </Typography>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setProofJson('');
                setParseError(null);
              }}
              isDisabled={
                (!proofJson && !parseError) ||
                isSubmittingProofs ||
                isConfirmingProofs
              }
            >
              Clear
            </Button>
            <Button
              isFullWidth
              onClick={handleSubmitProofs}
              isLoading={isSubmittingProofs || isConfirmingProofs}
              isDisabled={
                !proofJson.trim() || isSubmittingProofs || isConfirmingProofs
              }
            >
              {isSubmittingProofs
                ? 'Submitting...'
                : isConfirmingProofs
                  ? 'Confirming...'
                  : 'Submit Checkpoint Proofs'}
            </Button>
          </div>
        </div>
      ) : (
        // No active checkpoint view
        <div className="space-y-4">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Start a checkpoint to update validator balances and record any
            beacon chain changes.
          </Typography>

          {podInfo.activeValidatorCount === 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg">
              <Typography
                variant="body2"
                className="text-yellow-700 dark:text-yellow-300"
              >
                You need at least one active validator to start a checkpoint.
                First verify your withdrawal credentials.
              </Typography>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="revertIfNoBalance"
              checked={revertIfNoBalance}
              onChange={(e) => setRevertIfNoBalance(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="revertIfNoBalance"
              className="text-sm text-mono-120 dark:text-mono-80"
            >
              Revert if pod has no ETH balance
            </label>
          </div>

          {startError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error: {startError.message || 'Failed to start checkpoint'}
              </Typography>
            </div>
          )}

          {isStartSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">
                Checkpoint started successfully!
              </Typography>
            </div>
          )}

          <Button
            isFullWidth
            onClick={handleStartCheckpoint}
            isLoading={isStartingCheckpoint || isConfirmingStart}
            isDisabled={
              !canStartCheckpoint || isStartingCheckpoint || isConfirmingStart
            }
          >
            {isStartingCheckpoint
              ? 'Starting...'
              : isConfirmingStart
                ? 'Confirming...'
                : 'Start Checkpoint'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CheckpointCard;
