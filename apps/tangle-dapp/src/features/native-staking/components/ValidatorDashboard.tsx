import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  Input,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { keccak256 } from 'viem';
import { useValidatorInfo, usePodInfo } from '../hooks';
import { ValidatorStatus, gweiToEth } from '../types';

interface ValidatorDashboardProps {
  podAddress: Address;
}

const getStatusLabel = (status: ValidatorStatus): string => {
  switch (status) {
    case ValidatorStatus.INACTIVE:
      return 'Inactive';
    case ValidatorStatus.ACTIVE:
      return 'Active';
    case ValidatorStatus.WITHDRAWN:
      return 'Withdrawn';
    default:
      return 'Unknown';
  }
};

const getStatusColor = (status: ValidatorStatus): string => {
  switch (status) {
    case ValidatorStatus.INACTIVE:
      return 'text-yellow-600 dark:text-yellow-400';
    case ValidatorStatus.ACTIVE:
      return 'text-green-600 dark:text-green-400';
    case ValidatorStatus.WITHDRAWN:
      return 'text-mono-100';
    default:
      return 'text-mono-100';
  }
};

const ValidatorLookup: FC<{ podAddress: Address }> = ({ podAddress }) => {
  const [pubkey, setPubkey] = useState('');
  const [searchedPubkeyHash, setSearchedPubkeyHash] = useState<
    `0x${string}` | undefined
  >();

  const { data: validatorInfo, isLoading } = useValidatorInfo(
    podAddress,
    searchedPubkeyHash,
  );

  const handleSearch = () => {
    if (!pubkey.startsWith('0x') || pubkey.length !== 98) {
      return;
    }
    const hash = keccak256(pubkey as `0x${string}`);
    setSearchedPubkeyHash(hash);
  };

  return (
    <div className="space-y-4">
      <Typography variant="body1" fw="bold">
        Validator Lookup
      </Typography>

      <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
        Enter a validator public key to check its status in this pod.
      </Typography>

      <div className="flex gap-2">
        <Input
          id="validatorPubkey"
          placeholder="0x... (48-byte BLS pubkey)"
          value={pubkey}
          onChange={setPubkey}
          className="flex-1"
        />
        <Button
          onClick={handleSearch}
          isLoading={isLoading}
          isDisabled={pubkey.length !== 98}
        >
          Search
        </Button>
      </div>

      {searchedPubkeyHash && validatorInfo && (
        <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Status
            </Typography>
            <Typography
              variant="body1"
              fw="bold"
              className={getStatusColor(validatorInfo.status)}
            >
              {getStatusLabel(validatorInfo.status)}
            </Typography>
          </div>

          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Validator Index
            </Typography>
            <Typography variant="body1" fw="bold">
              {validatorInfo.validatorIndex}
            </Typography>
          </div>

          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Restaked Balance
            </Typography>
            <Typography variant="body1" fw="bold">
              {gweiToEth(validatorInfo.restakedBalanceGwei)} ETH
            </Typography>
          </div>

          <div className="flex items-center justify-between">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Last Checkpointed
            </Typography>
            <Typography variant="body1">
              {validatorInfo.lastCheckpointedAt > BigInt(0)
                ? new Date(
                    Number(validatorInfo.lastCheckpointedAt) * 1000,
                  ).toLocaleString()
                : 'Never'}
            </Typography>
          </div>

          <div className="pt-2 border-t border-mono-40 dark:border-mono-140">
            <Typography variant="body3" className="text-mono-100 break-all">
              Pubkey Hash: {searchedPubkeyHash}
            </Typography>
          </div>
        </div>
      )}

      {searchedPubkeyHash && !validatorInfo && !isLoading && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <Typography
            variant="body2"
            className="text-yellow-700 dark:text-yellow-300"
          >
            Validator not found in this pod. Make sure the validator&apos;s
            withdrawal credentials point to this pod address.
          </Typography>
        </div>
      )}
    </div>
  );
};

const ValidatorDashboard: FC<ValidatorDashboardProps> = ({ podAddress }) => {
  const { data: podInfo, isLoading } = usePodInfo(podAddress);

  if (isLoading || !podInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Validators
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading validator information...
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Validators
      </Typography>

      <div className="space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Active Validators
            </Typography>
            <Typography variant="h5" fw="bold">
              {podInfo.activeValidatorCount}
            </Typography>
          </div>
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Total Restaked
            </Typography>
            <Typography variant="h5" fw="bold">
              {gweiToEth(podInfo.totalRestakedBalanceGwei)} ETH
            </Typography>
          </div>
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Restake Status
            </Typography>
            <Typography
              variant="h5"
              fw="bold"
              className={
                podInfo.hasRestaked
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }
            >
              {podInfo.hasRestaked ? 'Active' : 'Pending'}
            </Typography>
          </div>
        </div>

        {/* Validator onboarding instructions */}
        {podInfo.activeValidatorCount === 0 && (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg space-y-3">
            <Typography
              variant="body1"
              fw="bold"
              className="text-blue-700 dark:text-blue-300"
            >
              Add Your First Validator
            </Typography>
            <ol className="list-decimal list-inside text-sm text-blue-600 dark:text-blue-400 space-y-2">
              <li>
                Update your validator&apos;s withdrawal credentials to point to
                your pod address:
                <code className="block mt-1 p-2 bg-blue-200/50 dark:bg-blue-800/30 rounded text-xs break-all">
                  {podInfo.withdrawalCredentials}
                </code>
              </li>
              <li>
                Generate credential proofs using{' '}
                <code className="bg-blue-200/50 dark:bg-blue-800/30 px-1 rounded">
                  tanglepod-cli credential-proof
                </code>
              </li>
              <li>
                Submit the proof bundle to verify your withdrawal credentials
              </li>
              <li>Your validator will appear here once verified</li>
            </ol>
          </div>
        )}

        {/* Validator lookup */}
        <ValidatorLookup podAddress={podAddress} />

        {/* Active validators note */}
        {podInfo.activeValidatorCount > 0 && (
          <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              This pod has {podInfo.activeValidatorCount} active validator
              {podInfo.activeValidatorCount !== 1 ? 's' : ''}. Use the lookup
              above to check individual validator status, or run checkpoints to
              update balances.
            </Typography>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ValidatorDashboard;
