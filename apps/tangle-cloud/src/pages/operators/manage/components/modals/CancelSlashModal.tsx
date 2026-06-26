import type { ChangeEvent } from 'react';
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
  SlashTextarea,
  Text,
} from './SandboxModalPrimitives';

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
          <Text variant="body1" className="mb-2">
            Cancel slash proposal #{selectedSlash?.id.toString()}
          </Text>
          <Text
            variant="body2"
            className="text-mono-100 dark:text-mono-80 mb-2"
          >
            Admin-only action. Authorization is validated on-chain at submission
            time.
          </Text>
          <div>
            <Text variant="body2" className="mb-1">
              Reason for cancellation
            </Text>
            <SlashTextarea
              rows={4}
              value={cancelReason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onCancelReasonChange(event.target.value)
              }
              placeholder="Provide cancellation reason..."
            />
            <Text
              variant="body3"
              className="text-mono-100 dark:text-mono-80 mt-1"
            >
              Minimum {minCancelReasonLength} characters (
              {trimmedCancelReasonLength}/{minCancelReasonLength}).
            </Text>
            {!selectedSlashPermissions?.canCancel ? (
              <Text variant="body3" className="text-red-500 mt-1">
                {selectedSlashPermissions?.cancelReason ??
                  'Cancellation is not available for this slash.'}
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
