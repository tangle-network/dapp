import { FC, useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { useVerifyWithdrawalCredentials, usePodInfo } from '../hooks';
import type { CredentialProofBundle } from '../types';

interface VerifyCredentialsCardProps {
  podAddress: Address;
}

const VerifyCredentialsCard: FC<VerifyCredentialsCardProps> = ({
  podAddress,
}) => {
  const { data: podInfo, refetch } = usePodInfo(podAddress);
  const {
    verifyWithdrawalCredentials,
    isPending,
    isConfirming,
    isSuccess,
    error,
  } = useVerifyWithdrawalCredentials(podAddress);

  const [proofJson, setProofJson] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Refetch after successful verification
  if (isSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setProofJson(content);
        setParseError(null);
      };
      reader.onerror = () => {
        setParseError('Failed to read file');
      };
      reader.readAsText(file);
    },
    [],
  );

  const handleSubmitProof = useCallback(() => {
    try {
      const parsed = JSON.parse(proofJson) as CredentialProofBundle;

      // Validate required fields
      if (
        !parsed.beaconTimestamp ||
        !parsed.stateRootProof ||
        !parsed.validatorIndices ||
        !parsed.validatorFieldsProofs ||
        !parsed.validatorFields
      ) {
        setParseError('Invalid proof bundle format');
        return;
      }

      setParseError(null);
      verifyWithdrawalCredentials(parsed);
    } catch {
      setParseError('Invalid JSON format');
    }
  }, [proofJson, verifyWithdrawalCredentials]);

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Verify Withdrawal Credentials
      </Typography>

      <div className="space-y-4">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Submit credential proofs to verify that your validators&apos;
          withdrawal credentials point to this pod.
        </Typography>

        {/* Pod address display */}
        <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
          <Typography variant="body2" fw="bold" className="mb-2">
            Your Pod&apos;s Withdrawal Credentials
          </Typography>
          <code className="text-xs font-mono break-all">
            {podInfo?.withdrawalCredentials || 'Loading...'}
          </code>
          <Typography variant="body3" className="text-mono-100 mt-2">
            Your validators must have these withdrawal credentials set.
          </Typography>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Typography variant="body2" fw="bold">
            How to generate credential proofs:
          </Typography>
          <ol className="list-decimal list-inside text-sm text-mono-120 dark:text-mono-80 space-y-1">
            <li>
              Install the Tangle Pod CLI:{' '}
              <code className="bg-mono-40 dark:bg-mono-140 px-1 rounded">
                npm install -g tanglepod-cli
              </code>
            </li>
            <li>
              Run:{' '}
              <code className="bg-mono-40 dark:bg-mono-140 px-1 rounded">
                tanglepod-cli credential-proof --pod {podAddress.slice(0, 10)}
                ... --validator-index YOUR_INDEX
              </code>
            </li>
            <li>Upload the generated JSON file below</li>
          </ol>
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <Typography variant="body2" fw="bold">
            Upload Proof Bundle
          </Typography>
          <input
            type="file"
            accept=".json"
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

        {/* Manual JSON input */}
        <div className="space-y-2">
          <Typography variant="body2" className="text-mono-100">
            Or paste JSON directly:
          </Typography>
          <textarea
            value={proofJson}
            onChange={(e) => {
              setProofJson(e.target.value);
              setParseError(null);
            }}
            placeholder='{"beaconTimestamp": ..., "stateRootProof": ..., ...}'
            className="w-full h-32 p-3 text-sm font-mono rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Errors and success */}
        {parseError && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
            <Typography variant="body2">{parseError}</Typography>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
            <Typography variant="body2">
              Error: {error.message || 'Failed to verify credentials'}
            </Typography>
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
            <Typography variant="body2">
              Credentials verified successfully! Your validators are now staked.
            </Typography>
          </div>
        )}

        <Button
          isFullWidth
          onClick={handleSubmitProof}
          isLoading={isPending || isConfirming}
          isDisabled={!proofJson || isPending || isConfirming}
        >
          {isPending
            ? 'Submitting...'
            : isConfirming
              ? 'Confirming...'
              : 'Verify Credentials'}
        </Button>
      </div>
    </Card>
  );
};

export default VerifyCredentialsCard;
