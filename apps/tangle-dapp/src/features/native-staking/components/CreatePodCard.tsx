import { FC } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import { useAccount } from 'wagmi';
import { useCreatePod, useHasPod } from '../hooks';

const CreatePodCard: FC = () => {
  const { address, isConnected } = useAccount();
  const { hasPod, isLoading: checkingPod, refetch } = useHasPod(address);
  const { createPod, isPending, isConfirming, isSuccess, error } =
    useCreatePod();

  const handleCreatePod = () => {
    createPod();
  };

  // Refetch pod status after successful creation
  if (isSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  if (!isConnected) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Create Validator Pod
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Connect your wallet to create a validator pod for native staking.
        </Typography>
      </Card>
    );
  }

  if (checkingPod) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Checking Pod Status...
        </Typography>
      </Card>
    );
  }

  if (hasPod) {
    return null; // Pod already exists, don't show create card
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Create Validator Pod
      </Typography>

      <div className="space-y-4">
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Create a validator pod to stake your beacon chain ETH on Tangle. Your
          pod will serve as the withdrawal credential target for your Ethereum
          validators.
        </Typography>

        <div className="bg-mono-20 dark:bg-mono-160 p-4 rounded-lg space-y-2">
          <Typography variant="body2" fw="bold">
            Important Notes:
          </Typography>
          <ul className="list-disc list-inside text-sm text-mono-120 dark:text-mono-80 space-y-1">
            <li>Only one pod per address is allowed</li>
            <li>Pod creation deploys a new contract</li>
            <li>
              After creation, update your validator withdrawal credentials to
              point to your pod
            </li>
            <li>
              Use the{' '}
              <code className="bg-mono-40 dark:bg-mono-140 px-1 rounded">
                tanglepod-cli
              </code>{' '}
              to generate credential proofs
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
            <Typography variant="body2">
              Error: {error.message || 'Failed to create pod'}
            </Typography>
          </div>
        )}

        {isSuccess && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
            <Typography variant="body2">Pod created successfully!</Typography>
          </div>
        )}

        <Button
          isFullWidth
          onClick={handleCreatePod}
          isLoading={isPending || isConfirming}
          isDisabled={isPending || isConfirming}
        >
          {isPending
            ? 'Creating Pod...'
            : isConfirming
              ? 'Confirming...'
              : 'Create Pod'}
        </Button>
      </div>
    </Card>
  );
};

export default CreatePodCard;
