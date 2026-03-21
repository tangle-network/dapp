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
import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';
import { AmountFormatStyle } from '@tangle-network/ui-components';
import useCredits from '../../../data/credits/useCredits';
import useClaimCreditsTx from '../../../data/credits/useClaimCreditsTx';
import { meetsMinimumClaimThreshold } from '../../../utils/creditConstraints';
import CreditVelocityTooltip from './CreditVelocityTooltip';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ClaimCreditsModal: FC<Props> = ({ isOpen, setIsOpen }) => {
  const { data, refetch, isPending, isSupportedNetwork, error } = useCredits();
  const { execute, status } = useClaimCreditsTx();
  const [offchainAccountId, setOffchainAccountId] = useState('');
  const [inputError, setInputError] = useState('');
  const nativeTokenSymbol = useNetworkStore(
    (state) => state.network2?.tokenSymbol,
  );
  const errorMessage =
    error?.message === 'Credits root mismatch'
      ? 'Credits data is out of sync. Please try again later.'
      : error?.message;

  const handleClaimCredits = useCallback(async () => {
    if (!offchainAccountId.trim()) {
      setInputError('Please enter your offchain account ID');
      return;
    }

    if (!execute || !data?.amount || !data.epochId || !data.merkleProof) return;

    try {
      await execute({
        epochId: data.epochId,
        amountToClaim: data.amount,
        offchainAccountId,
        merkleProof: data.merkleProof,
      });
      await refetch();
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to claim credits:', error);
    }
  }, [offchainAccountId, execute, refetch, setIsOpen, data]);

  const formattedAmount = data?.amount
    ? formatTokenAmount(
        data.amount,
        TANGLE_TOKEN_DECIMALS,
        AmountFormatStyle.SHORT,
      )
    : '0';

  const isLoading = status === TxStatus.PROCESSING;
  const hasCredits =
    data?.totalAmount !== undefined && data.totalAmount !== BigInt(0);
  const meetsMinimumThreshold = meetsMinimumClaimThreshold(data?.amount);
  const canClaim = hasCredits && meetsMinimumThreshold && !data?.hasClaimed;

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Claim AI Credits</ModalTitle>
        </ModalHeader>

        <ModalBody className="p-4 space-y-6">
          {!isSupportedNetwork ? (
            <>
              <Typography variant="body1" ta="center">
                Credits are not available on this network.
              </Typography>
              <Button
                isFullWidth
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </>
          ) : isPending ? (
            <Typography variant="body1" ta="center">
              Loading your available credits...
            </Typography>
          ) : error ? (
            <>
              <Typography variant="body1" ta="center">
                {errorMessage}
              </Typography>
              <Button
                isFullWidth
                variant="secondary"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
            </>
          ) : hasCredits ? (
            <>
              <div className="flex flex-col items-center justify-center p-4 bg-glass dark:bg-glass_dark rounded-xl border border-mono-0 dark:border-mono-180">
                <div className="flex items-center gap-2">
                  <Typography variant="body1" fw="bold">
                    Available Credits
                  </Typography>
                  <CreditVelocityTooltip
                    currentAmount={data?.amount}
                    tokenSymbol={nativeTokenSymbol}
                  />
                </div>

                <Typography variant="h3" fw="bold">
                  {formattedAmount} {nativeTokenSymbol}
                </Typography>

                {!meetsMinimumThreshold && (
                  <Typography
                    variant="body2"
                    className="text-yellow-600 dark:text-yellow-400 mt-2"
                  >
                    Minimum 0.01 {nativeTokenSymbol} required to claim
                  </Typography>
                )}

                {data?.hasClaimed && (
                  <Typography
                    variant="body2"
                    className="text-emerald-600 dark:text-emerald-400 mt-2"
                  >
                    Already claimed for this epoch.
                  </Typography>
                )}
              </div>

              <div className="space-y-2">
                <Typography variant="body1" fw="bold">
                  AI App User ID
                </Typography>
                <Typography
                  variant="body2"
                  className="text-mono-120 dark:text-mono-80"
                >
                  Enter your AI app user ID to associate with these credits
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

              <Button
                isFullWidth
                isDisabled={!canClaim || isLoading || !execute}
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
                tokens to earn credits.
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

export default ClaimCreditsModal;
