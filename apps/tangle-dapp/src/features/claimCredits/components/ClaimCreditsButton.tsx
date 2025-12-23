import { CrossCircledIcon } from '@radix-ui/react-icons';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { Spinner } from '@tangle-network/icons';
import { SparklingIcon } from '@tangle-network/icons';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { BN } from '@polkadot/util';
import {
  AmountFormatStyle,
  Button,
  formatDisplayAmount,
  Typography,
  TextField,
} from '@tangle-network/ui-components';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
} from '@tangle-network/ui-components/components/Dropdown';
import { useCallback, useMemo, useState } from 'react';
import useCredits from '../../../data/credits/useCredits';
import useClaimCreditsTx from '../../../data/credits/useClaimCreditsTx';
import { meetsMinimumClaimThreshold } from '../../../utils/creditConstraints';
import CreditVelocityTooltip from './CreditVelocityTooltip';

const ClaimCreditsButton = () => {
  const { data, error, refetch, isPending, isSupportedNetwork } = useCredits();
  const [offchainAccountId, setOffchainAccountId] = useState('');
  const [inputError, setInputError] = useState('');

  const formattedCredits = useMemo(() => {
    if (!data) {
      return '0';
    }

    return formatDisplayAmount(
      new BN(data.amount.toString()),
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );
  }, [data]);

  const meetsMinimumThreshold = useMemo(() => {
    return meetsMinimumClaimThreshold(data?.amount);
  }, [data?.amount]);

  const formattedTimeRemaining = useMemo(() => {
    if (!data?.timeRemaining || data.timeRemaining === BigInt(0)) {
      return '';
    }

    const total = Number(data.timeRemaining);
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }, [data?.timeRemaining]);

  const isUnavailable = !isSupportedNetwork;
  const errorLabel = useMemo(() => {
    if (!error) {
      return '';
    }
    if (error.message === 'Credits root mismatch') {
      return 'Credits data out of sync';
    }
    if (error.message === 'Credits proof invalid') {
      return 'Credits proof invalid';
    }
    return error.message;
  }, [error]);

  return (
    <Dropdown>
      <DropdownButton
        disabled={isPending || error !== null || isUnavailable}
        isHideArrowIcon={isPending || error !== null || isUnavailable}
        icon={
          isPending ? (
            <Spinner size="lg" />
          ) : error || isUnavailable ? (
            <CrossCircledIcon className="size-6" />
          ) : (
            <SparklingIcon size="md" />
          )
        }
      >
        <span className="hidden sm:inline-block">
          {isPending
            ? 'Fetching credits...'
            : isUnavailable
              ? 'Credits unavailable'
              : error
                ? errorLabel
                : formattedCredits}
        </span>
      </DropdownButton>

      <DropdownBody align="start" sideOffset={8} className="p-4 space-y-3">
        {isUnavailable ? (
          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            Credits are not available on this network.
          </Typography>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography variant="body1" fw="bold">
              Unclaimed AI Credits
            </Typography>
            <CreditVelocityTooltip currentAmount={data?.amount} />
          </div>

          <Typography variant="body1" fw="bold">
            {formattedCredits}
          </Typography>
        </div>

        {data?.amount !== undefined &&
        data.amount !== BigInt(0) &&
        !meetsMinimumThreshold ? (
          <Typography
            variant="body2"
            className="text-blue-600 dark:text-blue-400"
          >
            Minimum 0.01 required to claim
          </Typography>
        ) : null}

        {data?.timeRemaining !== undefined &&
        data.timeRemaining > BigInt(0) ? (
          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            Epoch ends in {formattedTimeRemaining}. Claims unlock after the
            epoch closes.
          </Typography>
        ) : null}

        {data?.hasClaimed ? (
          <Typography
            variant="body2"
            className="text-emerald-600 dark:text-emerald-400"
          >
            Already claimed for this epoch.
          </Typography>
        ) : null}

        <Typography variant="body2" fw="semibold" className="!text-muted">
          Associate your AI app account to claim these credits.
        </Typography>

        <div className="space-y-2">
          <Typography variant="body2" fw="semibold">
            AI App User ID
          </Typography>
          <TextField.Root
            error={inputError}
            className="p-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-140 dark:text-mono-40 border border-mono-80 dark:border-mono-120"
          >
            <TextField.Input
              className="font-light"
              value={offchainAccountId}
              onChange={(e) => {
                setOffchainAccountId(e.target.value);
                setInputError('');
              }}
              placeholder="Enter your AI app user ID"
            />
          </TextField.Root>
        </div>

        <CreditsButton
          credits={data?.amount}
          epochId={data?.epochId}
          merkleProof={data?.merkleProof}
          hasClaimed={data?.hasClaimed}
          totalCredits={data?.totalAmount}
          isClaimable={data?.isClaimable}
          offchainAccountId={offchainAccountId}
          setOffchainAccountId={setOffchainAccountId}
          setInputError={setInputError}
          refetchCredits={refetch}
        />
      </DropdownBody>
    </Dropdown>
  );
};

export default ClaimCreditsButton;

type CreditsButtonProps = {
  credits?: bigint;
  epochId?: bigint;
  merkleProof?: `0x${string}`[];
  hasClaimed?: boolean;
  totalCredits?: bigint;
  isClaimable?: boolean;
  offchainAccountId: string;
  setOffchainAccountId: (value: string) => void;
  setInputError: (value: string) => void;
  refetchCredits: () => Promise<any>;
};

const CreditsButton = ({
  credits,
  epochId,
  merkleProof,
  hasClaimed,
  totalCredits,
  isClaimable,
  offchainAccountId,
  setOffchainAccountId,
  setInputError,
  refetchCredits,
}: CreditsButtonProps) => {
  const { execute, status } = useClaimCreditsTx();

  const handleClick = useCallback(async () => {
    if (!offchainAccountId.trim()) {
      setInputError('Please enter your offchain account ID');
      return;
    }

    if (execute === null || !credits || !epochId || !merkleProof) {
      return null;
    }

    try {
      await execute({
        epochId,
        amountToClaim: credits,
        offchainAccountId,
        merkleProof,
      });

      await refetchCredits();
      setOffchainAccountId('');
    } catch (error) {
      console.error('Failed to claim credits:', error);
    }
  }, [
    credits,
    execute,
    epochId,
    merkleProof,
    offchainAccountId,
    refetchCredits,
    setOffchainAccountId,
    setInputError,
  ]);

  const isLoading = useMemo(() => status === TxStatus.PROCESSING, [status]);
  const hasCredits = useMemo(() => {
    return totalCredits !== undefined && totalCredits !== BigInt(0);
  }, [totalCredits]);
  const meetsMinimumThreshold = useMemo(() => {
    return meetsMinimumClaimThreshold(credits);
  }, [credits]);
  const canClaim = useMemo(() => {
    return hasCredits && meetsMinimumThreshold && !hasClaimed && isClaimable;
  }, [hasClaimed, hasCredits, isClaimable, meetsMinimumThreshold]);

  return (
    <Button
      isFullWidth
      isDisabled={
        !canClaim || isLoading || execute === null || !offchainAccountId.trim()
      }
      onClick={handleClick}
      isLoading={isLoading}
    >
      Claim
    </Button>
  );
};
