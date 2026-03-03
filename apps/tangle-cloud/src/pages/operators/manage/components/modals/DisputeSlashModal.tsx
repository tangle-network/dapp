import {
  SlashActionPermissions,
  SlashDisputeEligibility,
  SlashProposal,
  formatSlashBps,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';
import {
  formatDateTime,
  formatTimeRemaining,
  getSlashClaimContext,
  getSlashProposerRoleLabel,
} from '../../utils';

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
          <Typography variant="body1" className="mb-2">
            Dispute slash proposal #{selectedSlash?.id.toString()}
          </Typography>
          <div className="p-3 bg-mono-20 dark:bg-mono-170 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-x-2 gap-y-3">
              <Typography variant="body3" className="text-mono-100">
                Slash %:
              </Typography>
              <Typography variant="body3" className="text-red-500">
                {selectedSlash ? formatSlashBps(selectedSlash.slashBps) : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Effective Slash %:
              </Typography>
              <Typography variant="body3" className="text-red-500">
                {selectedSlash
                  ? formatSlashBps(selectedSlash.effectiveSlashBps)
                  : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Dispute Deadline:
              </Typography>
              <Typography variant="body3">
                {selectedSlash
                  ? formatDateTime(selectedSlash.executeAfter)
                  : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Time Remaining:
              </Typography>
              <Typography variant="body3">
                {selectedSlashEligibility
                  ? formatTimeRemaining(
                      selectedSlashEligibility.secondsUntilDeadline,
                    )
                  : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Proposer:
              </Typography>
              <Typography variant="body3" className="font-mono">
                {selectedSlash ? shortenHex(selectedSlash.proposer) : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Proposer Role:
              </Typography>
              <Typography variant="body3">
                {selectedSlash
                  ? getSlashProposerRoleLabel(selectedSlash.proposerRole)
                  : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Claim Context:
              </Typography>
              <Typography
                variant="body3"
                title={
                  selectedSlash ? getSlashClaimContext(selectedSlash) : '-'
                }
              >
                {selectedSlash ? getSlashClaimContext(selectedSlash) : '-'}
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Evidence Hash:
              </Typography>
              <Typography variant="body3" className="font-mono break-all">
                {selectedSlash?.evidence ?? '-'}
              </Typography>
            </div>
          </div>
          <div>
            <Typography variant="body2" className="mb-1">
              Reason for Dispute
            </Typography>
            <textarea
              className="w-full p-3 rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              value={disputeReason}
              onChange={(event) => onDisputeReasonChange(event.target.value)}
              placeholder="Explain why this slash proposal is invalid..."
            />
            <Typography variant="body3" className="text-mono-100 mt-1">
              Minimum {minDisputeReasonLength} characters (
              {trimmedDisputeReasonLength}/{minDisputeReasonLength}).
            </Typography>
            {!selectedSlashPermissions?.canDispute ? (
              <Typography variant="body3" className="text-red-500 mt-1">
                {selectedSlashPermissions?.disputeReason ??
                  'Dispute is not available for this slash.'}
              </Typography>
            ) : null}

            {errorMessage ? (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 mt-3 space-y-2">
                <Typography
                  variant="body3"
                  className="!text-red-70 dark:!text-red-50"
                >
                  {errorMessage}
                </Typography>
                <div>
                  <button
                    type="button"
                    className="text-xs underline text-red-70 dark:text-red-50"
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
