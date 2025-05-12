import { FC, useState, useCallback } from 'react';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import {
  Button,
  TextField,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from '@tangle-network/ui-components';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import useGitHubCredits from '../../../data/github/useGitHubCredits';
import useClaimGitHubCreditsTx from '../../../data/github/useClaimGitHubCreditsTx';
import { GithubFill } from '@tangle-network/icons';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ClaimGitHubCreditsModal: FC<Props> = ({ isOpen, setIsOpen }) => {
  const { data, refetch, isPending } = useGitHubCredits();
  const { execute, status } = useClaimGitHubCreditsTx();
  const [githubUsername, setGithubUsername] = useState(
    data?.githubUsername || '',
  );
  const [inputError, setInputError] = useState('');
  const nativeTokenSymbol = useNetworkStore(
    (state) => state.network2?.tokenSymbol,
  );

  const handleClaimCredits = useCallback(async () => {
    if (!githubUsername.trim()) {
      setInputError('Please enter your GitHub username');
      return;
    }

    if (!execute || !data?.amount) return;

    try {
      await execute({
        amountToClaim: data.amount,
        githubUsername,
      });
      await refetch();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to claim GitHub credits:', error);
    }
  }, [githubUsername, execute, refetch, setIsOpen, data]);

  const formattedAmount = data?.amount
    ? formatDisplayAmount(
        data.amount,
        TANGLE_TOKEN_DECIMALS,
        AmountFormatStyle.SHORT,
      )
    : '0';

  const isLoading = status === TxStatus.PROCESSING;
  const hasCredits = data?.amount && !data.amount.isZero();

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Claim GitHub Credits</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-4 space-y-6">
          {isPending ? (
            <Typography variant="body1" ta="center">
              Loading your available credits...
            </Typography>
          ) : hasCredits ? (
            <>
              <div className="flex flex-col items-center justify-center p-4 bg-glass dark:bg-glass_dark rounded-xl border border-mono-0 dark:border-mono-180">
                <Typography variant="body1" fw="bold">
                  Available Credits
                </Typography>

                <Typography variant="h3" fw="bold">
                  {formattedAmount} {nativeTokenSymbol}
                </Typography>
              </div>

              <div className="space-y-2">
                <Typography variant="body1" fw="bold">
                  GitHub Username
                </Typography>
                <Typography
                  variant="body2"
                  className="text-mono-120 dark:text-mono-80"
                >
                  Enter your GitHub username to associate with these credits
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

              <Button
                isFullWidth
                isDisabled={!hasCredits || isLoading}
                isLoading={isLoading}
                loadingText="Claiming credits..."
                onClick={handleClaimCredits}
              >
                Claim Credits
              </Button>
            </>
          ) : (
            <>
              <Typography variant="body1" ta="center">
                You don't have any credits available to claim. Stake your TNT
                tokens to earn credits for GitHub.
              </Typography>
              <Button
                isFullWidth
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ClaimGitHubCreditsModal;
