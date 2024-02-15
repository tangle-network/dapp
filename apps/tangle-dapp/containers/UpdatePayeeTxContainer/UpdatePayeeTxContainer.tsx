'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import { PAYMENT_DESTINATION_OPTIONS } from '../../constants';
import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { PaymentDestination } from '../../types';
import { convertToSubstrateAddress } from '../../utils';
import { updatePaymentDestination as updatePaymentDestinationEvm } from '../../utils/evm';
import { updatePaymentDestination as updatePaymentDestinationSubstrate } from '../../utils/polkadot';
import { UpdatePayeeTxContainerProps } from './types';
import UpdatePayee from './UpdatePayee';

const UpdatePayeeTxContainer: FC<UpdatePayeeTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();

  const { setTxConfirmationState } = useTxConfirmationModal();
  const [paymentDestination, setPaymentDestination] = useState<string>(
    PaymentDestination.Staked
  );
  const [
    isUpdatePaymentDestinationTxLoading,
    setIsUpdatePaymentDestinationTxLoading,
  ] = useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address) ?? '';
  }, [activeAccount?.address]);

  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestinationSubscription(substrateAddress);

  const continueToSignAndSubmitTx = useMemo(() => {
    return paymentDestination;
  }, [paymentDestination]);

  const closeModal = useCallback(() => {
    setIsUpdatePaymentDestinationTxLoading(false);
    setIsModalOpen(false);
    setPaymentDestination(PaymentDestination.Staked);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsUpdatePaymentDestinationTxLoading(true);

    try {
      const hash = await executeTx(
        () => updatePaymentDestinationEvm(walletAddress, paymentDestination),
        () =>
          updatePaymentDestinationSubstrate(walletAddress, paymentDestination),
        `Successfully updated payment destination to ${paymentDestination}.`,
        'Failed to update payment destination!'
      );

      setTxConfirmationState({
        isOpen: true,
        status: 'success',
        hash,
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } catch {
      setTxConfirmationState({
        isOpen: true,
        status: 'error',
        hash: '',
        txType: isSubstrateAddress(walletAddress) ? 'substrate' : 'evm',
      });
    } finally {
      closeModal();
    }
  }, [
    closeModal,
    executeTx,
    paymentDestination,
    setTxConfirmationState,
    walletAddress,
  ]);

  if (currentPaymentDestinationError) {
    notificationApi({
      variant: 'error',
      message: currentPaymentDestinationError.message,
    });
  }

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[1000px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Change Reward Destination
        </ModalHeader>

        <div className="px-8 py-6">
          <UpdatePayee
            currentPayee={currentPaymentDestination?.value1 ?? ''}
            paymentDestinationOptions={PAYMENT_DESTINATION_OPTIONS}
            paymentDestination={paymentDestination}
            setPaymentDestination={setPaymentDestination}
          />
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isUpdatePaymentDestinationTxLoading}
            onClick={submitAndSignTx}
          >
            Confirm
          </Button>

          <Link href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdatePayeeTxContainer;
