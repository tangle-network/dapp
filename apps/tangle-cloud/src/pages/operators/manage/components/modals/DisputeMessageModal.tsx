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
          <Text variant="body2" className="text-muted-foreground mb-2">
            Submitted dispute reason:
          </Text>
          <div className="rounded-lg border border-border p-3 bg-muted/40">
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
