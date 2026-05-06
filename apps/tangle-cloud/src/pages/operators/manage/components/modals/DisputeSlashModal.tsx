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
}: DisputeSlashModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Dispute Slash Proposal</ModalHeader>
        <ModalBody>
          <Text variant="body1" className="mb-2">
            Dispute slash proposal #{selectedSlash?.id.toString()}
          </Text>
          <div className="p-3 bg-muted/40 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <Text variant="body3" className="text-muted-foreground">
                Slash %:
              </Text>
              <Text variant="body3" className="text-red-500">
                {selectedSlash ? formatSlashBps(selectedSlash.slashBps) : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Effective Slash %:
              </Text>
              <Text variant="body3" className="text-red-500">
                {selectedSlash
                  ? formatSlashBps(selectedSlash.effectiveSlashBps)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Dispute Deadline:
              </Text>
              <Text variant="body3">
                {selectedSlash
                  ? formatDateTime(selectedSlash.executeAfter)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Time Remaining:
              </Text>
              <Text variant="body3">
                {selectedSlashEligibility
                  ? formatTimeRemaining(
                      selectedSlashEligibility.secondsUntilDeadline,
                    )
                  : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Proposer:
              </Text>
              <Text variant="body3" className="font-mono">
                {selectedSlash ? shortenHex(selectedSlash.proposer) : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Proposer Role:
              </Text>
              <Text variant="body3">
                {selectedSlash
                  ? getSlashProposerRoleLabel(selectedSlash.proposerRole)
                  : '-'}
              </Text>
              <Text variant="body3" className="text-muted-foreground">
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
              <Text variant="body3" className="text-muted-foreground">
                Evidence Hash:
              </Text>
              <Text variant="body3" className="font-mono break-all">
                {selectedSlash?.evidence ?? '-'}
              </Text>
            </div>
          </div>
          <div>
            <Text variant="body2" className="mb-1">
              Reason for Dispute
            </Text>
            <SlashTextarea
              rows={4}
              value={disputeReason}
              onChange={(event) => onDisputeReasonChange(event.target.value)}
              placeholder="Explain why this slash proposal is invalid..."
            />
            <Text variant="body3" className="text-muted-foreground mt-1">
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
                <Text variant="body3" className="!text-destructive">
                  {errorMessage}
                </Text>
                <div>
                  <button
                    type="button"
                    className="text-xs underline text-destructive"
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
