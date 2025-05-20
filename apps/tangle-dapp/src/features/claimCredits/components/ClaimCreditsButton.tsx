import { BN } from '@polkadot/util';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { Spinner } from '@tangle-network/icons';
import { SparklingIcon } from '@tangle-network/icons';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
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

const ClaimCreditsButton = () => {
  const { data, error, refetch, isPending } = useCredits();
  const [offchainAccountId, setOffchainAccountId] = useState('');
  const [inputError, setInputError] = useState('');

  const formattedCredits = useMemo(() => {
    if (!data) {
      return '0';
    }

    return formatDisplayAmount(
      data.amount,
      TANGLE_TOKEN_DECIMALS,
      AmountFormatStyle.SHORT,
    );
  }, [data]);

  // Hide if there's no data
  if (data === undefined) {
    return;
  }

  return (
    <Dropdown>
      <DropdownButton
        disabled={isPending || error !== null}
        isHideArrowIcon={isPending || error !== null}
        icon={
          isPending ? (
            <Spinner size="lg" />
          ) : error ? (
            <CrossCircledIcon className="size-6" />
          ) : (
            <SparklingIcon size="md" />
          )
        }
      >
        <span className="hidden sm:inline-block">
          {isPending
            ? 'Fetching credits...'
            : error
              ? error.name
              : formattedCredits}
        </span>
      </DropdownButton>

      <DropdownBody align="start" sideOffset={8} className="p-4 space-y-3">
        <Typography variant="body3" fw="bold" className="!text-muted uppercase">
          Unclaimed AI Credits
        </Typography>

        <Typography variant="h4" component="p" fw="bold">
          {formattedCredits}
        </Typography>

        <Typography variant="body2" fw="semibold" className="!text-muted">
          Associate your account to claim these credits.
        </Typography>

        <div className="space-y-2">
          <Typography variant="body2" fw="semibold">
            Account ID
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
              placeholder="Enter your account ID"
            />
          </TextField.Root>
        </div>

        <CreditsButton
          credits={data?.amount}
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
  credits?: BN;
  offchainAccountId: string;
  setOffchainAccountId: (value: string) => void;
  setInputError: (value: string) => void;
  refetchCredits: () => Promise<any>;
};

const CreditsButton = ({
  credits,
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

    if (execute === null || !credits) {
      return null;
    }

    try {
      await execute({
        amountToClaim: credits,
        offchainAccountId,
      });

      await refetchCredits();
      setOffchainAccountId('');
    } catch (error) {
      console.error('Failed to claim credits:', error);
    }
  }, [
    credits,
    execute,
    offchainAccountId,
    refetchCredits,
    setOffchainAccountId,
    setInputError,
  ]);

  const isLoading = useMemo(() => status === TxStatus.PROCESSING, [status]);
  const hasCredits = useMemo(() => credits && !credits.isZero(), [credits]);

  return (
    <Button
      isFullWidth
      isDisabled={!hasCredits || isLoading || !offchainAccountId.trim()}
      onClick={handleClick}
      isLoading={isLoading}
    >
      Claim
    </Button>
  );
};
