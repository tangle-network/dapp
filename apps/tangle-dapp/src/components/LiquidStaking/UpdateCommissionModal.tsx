import {
  isValidAddress,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useCallback, useEffect, useState } from 'react';

import useLsSetCommissionTx from '../../data/liquidStaking/tangle/useLsSetCommissionTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import AddressInput from '../AddressInput';
import PercentageInput from '../PercentageInput';
import { AddressType } from '../../constants';

export type UpdateCommissionModalProps = {
  poolId: number | null;
  currentCommissionFractional: number | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const UpdateCommissionModal: FC<UpdateCommissionModalProps> = ({
  poolId,
  currentCommissionFractional,
  isOpen,
  setIsOpen,
}) => {
  const [commission, setCommission] = useState<number | null>(null);
  const { execute, status } = useLsSetCommissionTx();
  const [isDestinationInputError, setIsDestinationInputError] = useState(false);

  const [payeeAccountAddress, setPayeeAccountAddress] = useState('');

  const isReady =
    poolId !== null &&
    execute !== null &&
    commission !== null &&
    commission !== currentCommissionFractional &&
    status !== TxStatus.PROCESSING &&
    payeeAccountAddress !== '' &&
    !isDestinationInputError &&
    isValidAddress(payeeAccountAddress);

  const handleUpdateCommissionClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    return execute({
      poolId,
      commissionFractional: commission,
      payeeAccountAddress,
    });
  }, [isReady, payeeAccountAddress, execute, poolId, commission]);

  // Automatically close the modal if the transaction was successful.
  useEffect(() => {
    if (status === TxStatus.COMPLETE) {
      setIsOpen(false);
    }
  }, [setIsOpen, status]);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent size="md">
        <ModalHeader>Update Pool Commission</ModalHeader>

        <ModalBody>
          <Typography variant="body1">
            Update the commission rate charged for this liquid staking pool. The
            commission will be deposited into the provided reward destination
            account address.
          </Typography>

          <AddressInput
            id="ls-update-commission-payee-address"
            type={AddressType.SUBSTRATE_OR_EVM}
            title="Commission Payee Address"
            value={payeeAccountAddress}
            setValue={setPayeeAccountAddress}
            wrapperOverrides={{ isFullWidth: true }}
            setErrorMessage={(error) =>
              setIsDestinationInputError(error !== null)
            }
            tooltip="The account address that will receive the commission rewards. This can be your active account address or another address."
          />

          <PercentageInput
            id="ls-update-commission"
            title="Commission Rate"
            placeholder="Enter new commission rate"
            value={commission}
            setValue={setCommission}
            wrapperProps={{ isFullWidth: true }}
          />
        </ModalBody>

        <ModalFooterActions
          onClose={() => setIsOpen(false)}
          isProcessing={status === TxStatus.PROCESSING}
          onConfirm={handleUpdateCommissionClick}
          isConfirmDisabled={!isReady}
        />
      </ModalContent>
    </Modal>
  );
};

export default UpdateCommissionModal;
