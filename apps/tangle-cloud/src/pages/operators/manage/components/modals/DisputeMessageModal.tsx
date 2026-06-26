import { SlashProposal } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Text,
} from './SandboxModalPrimitives';
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
          <Text variant="body1" className="mb-2">
            Slash proposal #{selectedSlash?.id.toString()}
          </Text>
          <Text
            variant="body2"
            className="text-mono-120 dark:text-mono-100 mb-2"
          >
            Submitted dispute reason:
          </Text>
          <div className="rounded-lg border border-mono-60 dark:border-mono-170 p-3 bg-mono-20/50 dark:bg-mono-190/50">
            <Text variant="body2" className="whitespace-pre-wrap break-words">
              {selectedSlash
                ? (getSlashDisputeMessage(selectedSlash) ??
                  'No dispute reason available for this proposal yet.')
                : '-'}
            </Text>
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
