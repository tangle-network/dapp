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
  Typography,
} from '@tangle-network/ui-components';
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
          <Typography variant="body1" className="mb-3">
            Slash proposal #{selectedSlash?.id.toString()}
          </Typography>
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
                    className="flex items-start gap-3 rounded-lg border border-mono-40 dark:border-mono-140 p-3"
                  >
                    <Chip
                      color={colorByState[stage.state]}
                      className="min-w-[5.25rem] justify-center"
                    >
                      {stage.state.toUpperCase()}
                    </Chip>
                    <div className="space-y-1">
                      <Typography variant="body2" fw="bold">
                        {stage.label}
                      </Typography>
                      <Typography variant="body3" className="text-mono-100">
                        {stage.description}
                      </Typography>
                      {stage.timestamp !== null ? (
                        <Typography variant="body3" className="text-mono-120">
                          {formatDateTime(stage.timestamp)}
                        </Typography>
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
