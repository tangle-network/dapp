import type { ChangeEvent } from 'react';
import { formatUnits, zeroAddress } from 'viem';
import {
  SlashActionPermissions,
  SlashDisputeEligibility,
  SlashProposal,
  formatSlashBps,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  SlashTextarea,
  Text,
} from './SandboxModalPrimitives';
import {
  formatDateTime,
  formatTimeRemaining,
  getSlashClaimContext,
  getSlashProposerRoleLabel,
} from '../../utils';

const shortenHex = (value: string) =>
  value.length <= 12 ? value : `${value.slice(0, 6)}...${value.slice(-4)}`;

// Trim trailing zeros so we don't show "0.000000000000000000 ETH" or
// "1.500000000000000000 ETH" in the bond row.
const formatEthAmount = (wei: bigint): string => {
  const formatted = formatUnits(wei, 18);
  if (!formatted.includes('.')) return formatted;
  return formatted.replace(/\.?0+$/, '');
};

interface DisputeSlashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlash: SlashProposal | null;
  selectedSlashEligibility: SlashDisputeEligibility | null;
  selectedSlashPermissions: SlashActionPermissions | null;
  disputeReason: string;
  onDisputeReasonChange: (value: string) => void;
  minDisputeReasonLength: number;
  trimmedDisputeReasonLength: number;
  canSubmitDispute: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  errorMessage: string | null;
  onDismissError: () => void;
  /**
   * msg.value the contract will require for disputeSlash. Read from the active
   * SlashConfig and surfaced here so the user knows what bond they are posting
   * before signing.
   */
  disputeBond: bigint;
  /**
   * Seconds remaining until the dispute resolution deadline. Only meaningful
   * when the slash is already in `Disputed` status; null otherwise.
   */
  disputeResolutionSecondsRemaining: number | null;
}

const DisputeSlashModal = ({
  open,
  onOpenChange,
  selectedSlash,
  selectedSlashEligibility,
  selectedSlashPermissions,
  disputeReason,
  onDisputeReasonChange,
  minDisputeReasonLength,
  trimmedDisputeReasonLength,
  canSubmitDispute,
  isSubmitting,
  onConfirm,
  errorMessage,
  onDismissError,
  disputeBond,
  disputeResolutionSecondsRemaining,
}: DisputeSlashModalProps) => {
  const isAlreadyDisputed = selectedSlash?.status === 'Disputed';
  const hasKnownDisputer =
    !!selectedSlash &&
    selectedSlash.disputer.toLowerCase() !== zeroAddress.toLowerCase();

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Dispute Slash Proposal</ModalHeader>
        <ModalBody>
          <Text variant="body1" className="mb-2">
            Dispute slash proposal #{selectedSlash?.id.toString()}
          </Text>
          <div className="p-3 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Slash %:
              </Text>
              <Text variant="body3" className="text-red-500">
                {selectedSlash ? formatSlashBps(selectedSlash.slashBps) : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Effective Slash %:
              </Text>
              <Text variant="body3" className="text-red-500">
                {selectedSlash
                  ? formatSlashBps(selectedSlash.effectiveSlashBps)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Dispute Deadline:
              </Text>
              <Text variant="body3">
                {selectedSlash
                  ? formatDateTime(selectedSlash.executeAfter)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Time Remaining:
              </Text>
              <Text variant="body3">
                {selectedSlashEligibility
                  ? formatTimeRemaining(
                      selectedSlashEligibility.secondsUntilDeadline,
                    )
                  : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Proposer:
              </Text>
              <Text variant="body3" className="font-mono">
                {selectedSlash ? shortenHex(selectedSlash.proposer) : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Proposer Role:
              </Text>
              <Text variant="body3">
                {selectedSlash
                  ? getSlashProposerRoleLabel(selectedSlash.proposerRole)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Claim Context:
              </Text>
              <Text
                variant="body3"
                title={
                  selectedSlash ? getSlashClaimContext(selectedSlash) : '-'
                }
              >
                {selectedSlash ? getSlashClaimContext(selectedSlash) : '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Evidence Hash:
              </Text>
              <Text variant="body3" className="font-mono break-all">
                {selectedSlash?.evidence ?? '-'}
              </Text>
              <Text variant="body3" className="text-mono-100 dark:text-mono-60">
                Required Dispute Bond:
              </Text>
              <Text variant="body3">
                {disputeBond > BigInt(0)
                  ? `${formatEthAmount(disputeBond)} ETH (claimable via claimDisputeBond if dispute upheld)`
                  : 'No bond required'}
              </Text>
              {isAlreadyDisputed && hasKnownDisputer ? (
                <>
                  <Text
                    variant="body3"
                    className="text-mono-100 dark:text-mono-60"
                  >
                    Disputer:
                  </Text>
                  <Text
                    variant="body3"
                    className="font-mono"
                    title={selectedSlash?.disputer ?? undefined}
                  >
                    {selectedSlash ? shortenHex(selectedSlash.disputer) : '-'}
                  </Text>
                </>
              ) : null}
              {isAlreadyDisputed &&
              disputeResolutionSecondsRemaining !== null ? (
                <>
                  <Text
                    variant="body3"
                    className="text-mono-100 dark:text-mono-60"
                  >
                    Resolution Deadline:
                  </Text>
                  <Text variant="body3">
                    {disputeResolutionSecondsRemaining > 0
                      ? formatTimeRemaining(disputeResolutionSecondsRemaining)
                      : 'Deadline passed'}
                  </Text>
                </>
              ) : null}
            </div>
          </div>
          <div>
            <Text variant="body2" className="mb-1">
              Reason for Dispute
            </Text>
            <SlashTextarea
              rows={4}
              value={disputeReason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onDisputeReasonChange(event.target.value)
              }
              placeholder="Explain why this slash proposal is invalid..."
            />
            <Text
              variant="body3"
              className="text-mono-100 dark:text-mono-60 mt-1"
            >
              Minimum {minDisputeReasonLength} characters (
              {trimmedDisputeReasonLength}/{minDisputeReasonLength}).
            </Text>
            {!selectedSlashPermissions?.canDispute ? (
              <Text variant="body3" className="text-red-500 mt-1">
                {selectedSlashPermissions?.disputeReason ??
                  'Dispute is not available for this slash.'}
              </Text>
            ) : null}

            {errorMessage ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mt-3 space-y-2">
                <Text
                  variant="body3"
                  className="!text-red-500 dark:text-red-400"
                >
                  {errorMessage}
                </Text>
                <div>
                  <button
                    type="button"
                    className="text-xs underline text-red-500 dark:text-red-400"
                    onClick={onDismissError}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </ModalBody>
        <ModalFooterActions
          hasCloseButton
          isConfirmDisabled={isSubmitting || !canSubmitDispute}
          isProcessing={isSubmitting}
          confirmButtonText="Submit Dispute"
          onConfirm={onConfirm}
        />
      </ModalContent>
    </Modal>
  );
};

export default DisputeSlashModal;
