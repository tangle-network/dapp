import { SlashProposal } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';
import { getSlashDisputeMessage } from '../../utils';

interface DisputeMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlash: SlashProposal | null;
}

const DisputeMessageModal = ({
  open,
  onOpenChange,
  selectedSlash,
}: DisputeMessageModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Dispute Reason</ModalHeader>
        <ModalBody>
          <Typography variant="body1" className="mb-2">
            Slash proposal #{selectedSlash?.id.toString()}
          </Typography>
          <Typography variant="body2" className="text-mono-100 mb-2">
            Submitted dispute reason:
          </Typography>
          <div className="rounded-lg border border-mono-40 dark:border-mono-140 p-3 bg-mono-20 dark:bg-mono-170">
            <Typography
              variant="body2"
              className="whitespace-pre-wrap break-words"
            >
              {selectedSlash
                ? (getSlashDisputeMessage(selectedSlash) ??
                  'No dispute reason available for this proposal yet.')
                : '-'}
            </Typography>
          </div>
        </ModalBody>
        <ModalFooterActions
          confirmButtonText="Close"
          onConfirm={() => onOpenChange(false)}
        />
      </ModalContent>
    </Modal>
  );
};

export default DisputeMessageModal;
