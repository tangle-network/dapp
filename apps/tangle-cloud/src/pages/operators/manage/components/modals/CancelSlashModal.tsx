import {
  SlashActionPermissions,
  SlashProposal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';

interface CancelSlashModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlash: SlashProposal | null;
  selectedSlashPermissions: SlashActionPermissions | null;
  cancelReason: string;
  onCancelReasonChange: (value: string) => void;
  minCancelReasonLength: number;
  trimmedCancelReasonLength: number;
  canSubmitCancel: boolean;
  isSubmitting: boolean;
  onConfirm: () => void;
  errorMessage: string | null;
  onDismissError: () => void;
}

const CancelSlashModal = ({
  open,
  onOpenChange,
  selectedSlash,
  selectedSlashPermissions,
  cancelReason,
  onCancelReasonChange,
  minCancelReasonLength,
  trimmedCancelReasonLength,
  canSubmitCancel,
  isSubmitting,
  onConfirm,
  errorMessage,
  onDismissError,
}: CancelSlashModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Cancel Slash Proposal</ModalHeader>
        <ModalBody>
          <Typography variant="body1" className="mb-2">
            Cancel slash proposal #{selectedSlash?.id.toString()}
          </Typography>
          <Typography variant="body2" className="text-mono-100 mb-2">
            Admin-only action. Authorization is validated on-chain at submission
            time.
          </Typography>
          <div>
            <Typography variant="body2" className="mb-1">
              Reason for cancellation
            </Typography>
            <textarea
              className="w-full p-3 rounded-lg border border-mono-40 dark:border-mono-140 bg-mono-0 dark:bg-mono-180 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={4}
              value={cancelReason}
              onChange={(event) => onCancelReasonChange(event.target.value)}
              placeholder="Provide cancellation reason..."
            />
            <Typography variant="body3" className="text-mono-100 mt-1">
              Minimum {minCancelReasonLength} characters (
              {trimmedCancelReasonLength}/{minCancelReasonLength}).
            </Typography>
            {!selectedSlashPermissions?.canCancel ? (
              <Typography variant="body3" className="text-red-500 mt-1">
                {selectedSlashPermissions?.cancelReason ??
                  'Cancellation is not available for this slash.'}
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
          isConfirmDisabled={isSubmitting || !canSubmitCancel}
          isProcessing={isSubmitting}
          confirmButtonText="Cancel Slash"
          onConfirm={onConfirm}
        />
      </ModalContent>
    </Modal>
  );
};

export default CancelSlashModal;
