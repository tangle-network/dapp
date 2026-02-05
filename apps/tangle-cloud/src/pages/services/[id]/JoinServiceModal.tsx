/**
 * Modal for joining a service as an operator.
 */

import { FC, useState, useCallback, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Typography,
  Button,
  Slider,
} from '@tangle-network/ui-components';
import { useJoinServiceTx } from '../../../data/services/useJoinServiceTx';
import ErrorMessage from '../../../components/ErrorMessage';

interface Props {
  serviceId: bigint;
  onClose: () => void;
}

const JoinServiceModal: FC<Props> = ({ serviceId, onClose }) => {
  const [exposurePercent, setExposurePercent] = useState<number>(50);

  const exposureBps = useMemo(() => Math.round(exposurePercent * 100), [exposurePercent]);

  const {
    execute: executeJoin,
    isPending: isJoining,
    isSuccess: joinSuccess,
    error: joinError,
  } = useJoinServiceTx({
    onSuccess: () => {
      onClose();
    },
  });

  const handleJoin = useCallback(async () => {
    if (!executeJoin) return;

    await executeJoin({
      serviceId,
      exposureBps,
    });
  }, [executeJoin, serviceId, exposureBps]);

  const canJoin = exposurePercent > 0 && !isJoining;

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="md">
        <ModalHeader>Join Service #{serviceId.toString()}</ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            <Typography variant="body2" className="text-mono-100">
              Configure your exposure percentage for this service. This
              determines how much of your staked assets are at risk for
              slashing if you fail to perform your duties.
            </Typography>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Typography variant="body2" fw="semibold">
                  Exposure Percentage
                </Typography>
                <Typography variant="body1" fw="bold" className="text-blue-400">
                  {exposurePercent.toFixed(1)}%
                </Typography>
              </div>

              <Slider
                value={[exposurePercent]}
                onChange={(values) => setExposurePercent(values[0])}
                min={0}
                max={100}
                step={0.1}
              />

              <div className="flex justify-between text-xs text-mono-100 mt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-mono-20 dark:bg-mono-170">
              <Typography variant="body2" className="text-mono-100 mb-2">
                Exposure Summary
              </Typography>
              <div className="flex justify-between">
                <span className="text-mono-100">Basis Points (BPS):</span>
                <span className="font-semibold">{exposureBps}</span>
              </div>
              <Typography variant="body3" className="text-mono-120 mt-2">
                Higher exposure means more of your stake is at risk, but may
                qualify you for higher rewards.
              </Typography>
            </div>

            {joinError && <ErrorMessage>{joinError.message}</ErrorMessage>}

            {joinSuccess && (
              <div className="p-3 rounded-lg bg-green-500/20 text-green-400">
                <Typography variant="body2">
                  Successfully joined service!
                </Typography>
              </div>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            isLoading={isJoining}
            isDisabled={!canJoin}
          >
            {isJoining ? 'Joining...' : 'Join Service'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JoinServiceModal;
