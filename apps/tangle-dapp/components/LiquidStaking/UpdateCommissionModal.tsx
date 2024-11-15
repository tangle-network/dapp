import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import assert from 'assert';
import { FC, useCallback, useEffect, useState } from 'react';
import { isAddress } from 'viem';

import useLsSetCommissionTx from '../../data/liquidStaking/tangle/useLsSetCommissionTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import isSubstrateAddress from '../../utils/isSubstrateAddress';
import AddressInput, { AddressType } from '../AddressInput';
import PercentageInput from '../PercentageInput';

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
    !isDestinationInputError;

  const handleUpdateCommissionClick = useCallback(() => {
    if (!isReady) {
      return;
    }

    // If it's ready, then the address must be either a valid
    // Substrate or EVM address.
    assert(
      isSubstrateAddress(payeeAccountAddress) || isAddress(payeeAccountAddress),
    );

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
    <Modal>
      <ModalContent isOpen={isOpen} className="w-full max-w-[550px]">
        <ModalHeader onClose={() => setIsOpen(false)}>
          Update Pool Commission
        </ModalHeader>

        <ModalBody>
          <Typography variant="body1">
            Update the commission rate charged for this liquid staking pool. The
            commission will be deposited into the provided reward destination
            account address.
          </Typography>

          <AddressInput
            id="ls-update-commission-payee-address"
            type={AddressType.Both}
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

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            isDisabled={status === TxStatus.PROCESSING}
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button
            isFullWidth
            onClick={handleUpdateCommissionClick}
            isLoading={status === TxStatus.PROCESSING}
            loadingText="Processing"
            isDisabled={!isReady}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateCommissionModal;
