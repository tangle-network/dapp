import { BN } from '@polkadot/util';
import { CrossCircledIcon } from '@radix-ui/react-icons';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { Spinner } from '@tangle-network/icons';
import { GithubFill } from '@tangle-network/icons';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
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
import useGitHubCredits from '../../../data/github/useGitHubCredits';
import useClaimGitHubCreditsTx from '../../../data/github/useClaimGitHubCreditsTx';

const ClaimGitHubCreditsButton = () => {
  const nativeTokenSymbol = useNetworkStore(
    (store) => store.network2?.tokenSymbol,
  );

  const { data, error, refetch, isPending } = useGitHubCredits();
  const [githubUsername, setGithubUsername] = useState('');
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
            <GithubFill size="lg" />
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
          GitHub Credits
        </Typography>

        <Typography variant="h4" component="p" fw="bold">
          {formattedCredits} {nativeTokenSymbol}
        </Typography>

        <Typography variant="body2" fw="semibold" className="!text-muted">
          Associate your GitHub account to claim these credits.
        </Typography>

        <div className="space-y-2">
          <Typography variant="body2" fw="semibold">
            GitHub Username
          </Typography>
          <TextField.Root
            error={inputError}
            className="p-2 rounded-lg bg-mono-0 dark:bg-mono-180 text-mono-140 dark:text-mono-40 border border-mono-80 dark:border-mono-120"
          >
            <TextField.Slot>
              <GithubFill size="md" />
            </TextField.Slot>

            <TextField.Input
              className="font-light"
              value={githubUsername}
              onChange={(e) => {
                setGithubUsername(e.target.value);
                setInputError('');
              }}
              placeholder="Enter your GitHub username"
            />
          </TextField.Root>
        </div>

        <ClaimCreditsButton
          credits={data?.amount}
          githubUsername={githubUsername}
          setGithubUsername={setGithubUsername}
          setInputError={setInputError}
          refetchCredits={refetch}
        />
      </DropdownBody>
    </Dropdown>
  );
};

export default ClaimGitHubCreditsButton;

type ClaimCreditsButtonProps = {
  credits?: BN;
  githubUsername: string;
  setGithubUsername: (value: string) => void;
  setInputError: (value: string) => void;
  refetchCredits: () => Promise<any>;
};

const ClaimCreditsButton = ({
  credits,
  githubUsername,
  setGithubUsername,
  setInputError,
  refetchCredits,
}: ClaimCreditsButtonProps) => {
  const { execute, status } = useClaimGitHubCreditsTx();

  const handleClick = useCallback(async () => {
    if (!githubUsername.trim()) {
      setInputError('Please enter your GitHub username');
      return;
    }

    if (execute === null || !credits) {
      return null;
    }

    try {
      await execute({
        amountToClaim: credits,
        githubUsername,
      });

      await refetchCredits();
      setGithubUsername('');
    } catch (error) {
      console.error('Failed to claim GitHub credits:', error);
    }
  }, [
    credits,
    execute,
    githubUsername,
    refetchCredits,
    setGithubUsername,
    setInputError,
  ]);

  const isLoading = useMemo(() => status === TxStatus.PROCESSING, [status]);
  const hasCredits = useMemo(() => credits && !credits.isZero(), [credits]);

  return (
    <Button
      isFullWidth
      isDisabled={!hasCredits || isLoading || !githubUsername.trim()}
      onClick={handleClick}
      isLoading={isLoading}
    >
      Claim
    </Button>
  );
};
