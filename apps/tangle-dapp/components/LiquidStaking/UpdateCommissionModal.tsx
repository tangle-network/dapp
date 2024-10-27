import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';

import PercentageInput from '../PercentageInput';

export type UpdateCommissionModalProps = {
  poolId: number;
  currentCommission: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const UpdateCommissionModal: FC<UpdateCommissionModalProps> = ({
  poolId,
  currentCommission,
  isOpen,
  setIsOpen,
}) => {
  const [commission, setCommission] = useState<number | null>(0);

  return (
    <Modal>
      <ModalContent isCenter isOpen={isOpen} className="w-full max-w-[550px]">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Update Pool Commission
        </ModalHeader>

        <ModalBody>
          <Typography variant="body1">
            Update the commission rate charged for this liquid staking pool. The
            commission will be deposited ...
          </Typography>

          <PercentageInput
            id="ls-update-commission"
            title="Commission Rate"
            placeholder="Enter new commission rate"
            value={commission}
            setValue={setCommission}
            wrapperProps={{ isFullWidth: true }}
          />
        </ModalBody>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button
            isFullWidth
            isDisabled={commission === null || commission === currentCommission}
          >
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCommissionModal;
