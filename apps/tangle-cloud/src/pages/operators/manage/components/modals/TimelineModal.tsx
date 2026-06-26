import {
  SlashProposal,
  SlashTimelineStage,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Text,
} from './SandboxModalPrimitives';
import { formatDateTime } from '../../utils';

interface TimelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSlash: SlashProposal | null;
  timeline: SlashTimelineStage[];
}

const TimelineModal = ({
  open,
  onOpenChange,
  selectedSlash,
  timeline,
}: TimelineModalProps) => {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>Slash Timeline</ModalHeader>
        <ModalBody>
          <Text variant="body1" className="mb-3">
            Slash proposal #{selectedSlash?.id.toString()}
          </Text>
          <div className="space-y-3">
            {timeline
              .filter(
                (stage) =>
                  stage.state !== 'upcoming' && stage.state !== 'skipped',
              )
              .map((stage) => {
                const colorByState: Record<
                  typeof stage.state,
                  'green' | 'blue' | 'yellow' | 'dark-grey' | 'red'
                > = {
                  done: 'green',
                  current: 'blue',
                  upcoming: 'yellow',
                  skipped: 'dark-grey',
                };

                return (
                  <div
                    key={stage.key}
                    className="flex items-start gap-3 rounded-lg border border-mono-60 dark:border-mono-170 p-3"
                  >
                    <Chip
                      color={colorByState[stage.state]}
                      className="min-w-[5.25rem] justify-center"
                    >
                      {stage.state.toUpperCase()}
                    </Chip>
                    <div className="space-y-1">
                      <Text variant="body2" fw="bold">
                        {stage.label}
                      </Text>
                      <Text
                        variant="body3"
                        className="text-mono-120 dark:text-mono-100"
                      >
                        {stage.description}
                      </Text>
                      {stage.timestamp !== null ? (
                        <Text
                          variant="body3"
                          className="text-mono-120 dark:text-mono-100"
                        >
                          {formatDateTime(stage.timestamp)}
                        </Text>
                      ) : null}
                    </div>
                  </div>
                );
              })}
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

export default TimelineModal;
