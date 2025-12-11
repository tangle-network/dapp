import { FC, useState, useMemo } from 'react';
import { Button, Card, CardVariant, Typography, Input } from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { isAddress, parseEther } from 'viem';
import { usePodOwnerInfo, useDelegateTo, useUndelegateFrom } from '../hooks';
import { weiToEth } from '../types';

interface DelegationCardProps {
  ownerAddress: Address;
}

const DelegationCard: FC<DelegationCardProps> = ({ ownerAddress }) => {
  const { data: ownerInfo, isLoading, refetch } = usePodOwnerInfo(ownerAddress);
  const {
    delegateTo,
    isPending: isDelegating,
    isConfirming: isConfirmingDelegate,
    isSuccess: delegateSuccess,
    error: delegateError,
  } = useDelegateTo();
  const {
    undelegateFrom,
    isPending: isUndelegating,
    isConfirming: isConfirmingUndelegate,
    isSuccess: undelegateSuccess,
    error: undelegateError,
  } = useUndelegateFrom();

  const [operatorAddress, setOperatorAddress] = useState('');
  const [delegateAmount, setDelegateAmount] = useState('');
  const [undelegateOperator, setUndelegateOperator] = useState('');
  const [undelegateAmount, setUndelegateAmount] = useState('');

  const isValidOperator = useMemo(
    () => operatorAddress === '' || isAddress(operatorAddress),
    [operatorAddress],
  );

  const isValidUndelegateOperator = useMemo(
    () => undelegateOperator === '' || isAddress(undelegateOperator),
    [undelegateOperator],
  );

  const parsedDelegateAmount = useMemo(() => {
    try {
      return delegateAmount ? parseEther(delegateAmount) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [delegateAmount]);

  const parsedUndelegateAmount = useMemo(() => {
    try {
      return undelegateAmount ? parseEther(undelegateAmount) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [undelegateAmount]);

  // Refetch after successful operations
  if (delegateSuccess || undelegateSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  const handleDelegate = () => {
    if (
      !isValidOperator ||
      !operatorAddress ||
      parsedDelegateAmount <= BigInt(0)
    )
      return;
    delegateTo(operatorAddress as Address, parsedDelegateAmount);
  };

  const handleUndelegate = () => {
    if (
      !isValidUndelegateOperator ||
      !undelegateOperator ||
      parsedUndelegateAmount <= BigInt(0)
    )
      return;
    undelegateFrom(undelegateOperator as Address, parsedUndelegateAmount);
  };

  if (isLoading || !ownerInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Delegation
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading delegation information...
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Delegation
      </Typography>

      <div className="space-y-6">
        {/* Current delegation status */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Your Shares
            </Typography>
            <Typography variant="h5" fw="bold">
              {weiToEth(ownerInfo.shares)} ETH
            </Typography>
          </div>
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Currently Delegated
            </Typography>
            <Typography variant="h5" fw="bold">
              {weiToEth(ownerInfo.totalDelegated)} ETH
            </Typography>
          </div>
        </div>

        {/* Delegate Section */}
        <div className="space-y-4 p-4 border border-mono-40 dark:border-mono-140 rounded-lg">
          <Typography variant="body1" fw="bold">
            Delegate to Operator
          </Typography>

          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            Delegate your restaked ETH to an operator to earn rewards.
          </Typography>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Operator Address
            </Typography>
            <Input
              id="operatorAddress"
              placeholder="0x..."
              value={operatorAddress}
              onChange={setOperatorAddress}
              isInvalid={!isValidOperator}
            />
            {!isValidOperator && (
              <Typography variant="body3" className="text-red-500">
                Please enter a valid Ethereum address
              </Typography>
            )}
          </div>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Amount (ETH)
            </Typography>
            <Input
              id="delegateAmount"
              type="number"
              placeholder="0.0"
              value={delegateAmount}
              onChange={setDelegateAmount}
            />
          </div>

          {delegateError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error: {delegateError.message || 'Failed to delegate'}
              </Typography>
            </div>
          )}

          {delegateSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">Delegated successfully!</Typography>
            </div>
          )}

          <Button
            isFullWidth
            onClick={handleDelegate}
            isLoading={isDelegating || isConfirmingDelegate}
            isDisabled={
              !operatorAddress ||
              !isValidOperator ||
              parsedDelegateAmount <= BigInt(0) ||
              isDelegating ||
              isConfirmingDelegate ||
              ownerInfo.shares <= BigInt(0)
            }
          >
            {isDelegating
              ? 'Delegating...'
              : isConfirmingDelegate
                ? 'Confirming...'
                : 'Delegate'}
          </Button>

          {ownerInfo.shares <= BigInt(0) && (
            <Typography
              variant="body3"
              className="text-yellow-600 dark:text-yellow-400"
            >
              You need restaked shares to delegate. First verify your validator
              withdrawal credentials.
            </Typography>
          )}
        </div>

        {/* Undelegate Section */}
        <div className="space-y-4 p-4 border border-mono-40 dark:border-mono-140 rounded-lg">
          <Typography variant="body1" fw="bold">
            Undelegate from Operator
          </Typography>

          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            Remove delegation from an operator to free up your shares.
          </Typography>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Operator Address
            </Typography>
            <Input
              id="undelegateOperator"
              placeholder="0x..."
              value={undelegateOperator}
              onChange={setUndelegateOperator}
              isInvalid={!isValidUndelegateOperator}
            />
          </div>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Amount (ETH)
            </Typography>
            <Input
              id="undelegateAmount"
              type="number"
              placeholder="0.0"
              value={undelegateAmount}
              onChange={setUndelegateAmount}
            />
          </div>

          {undelegateError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error: {undelegateError.message || 'Failed to undelegate'}
              </Typography>
            </div>
          )}

          {undelegateSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">Undelegation successful!</Typography>
            </div>
          )}

          <Button
            isFullWidth
            variant="secondary"
            onClick={handleUndelegate}
            isLoading={isUndelegating || isConfirmingUndelegate}
            isDisabled={
              !undelegateOperator ||
              !isValidUndelegateOperator ||
              parsedUndelegateAmount <= BigInt(0) ||
              isUndelegating ||
              isConfirmingUndelegate
            }
          >
            {isUndelegating
              ? 'Undelegating...'
              : isConfirmingUndelegate
                ? 'Confirming...'
                : 'Undelegate'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default DelegationCard;
