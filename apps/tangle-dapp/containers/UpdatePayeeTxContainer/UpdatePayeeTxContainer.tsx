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
import useNetworkStore from '../../context/useNetworkStore';
import usePaymentDestinationSubscription from '../../data/NominatorStats/usePaymentDestinationSubscription';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { StakingRewardsDestination } from '../../types';
import { evmToSubstrateAddress } from '../../utils';
import { updatePaymentDestination as updatePaymentDestinationEvm } from '../../utils/evm';
import { updatePaymentDestination as updatePaymentDestinationSubstrate } from '../../utils/polkadot';
import { UpdatePayeeTxContainerProps } from './types';
import UpdatePayee from './UpdatePayee';

const UpdatePayeeTxContainer: FC<UpdatePayeeTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const [payee, setPayee] = useState(StakingRewardsDestination.STAKED);

  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();
  const { rpcEndpoint } = useNetworkStore();

  const [
    isUpdatePaymentDestinationTxLoading,
    setIsUpdatePaymentDestinationTxLoading,
  ] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '';
    }

    if (isSubstrateAddress(activeAccount?.address)) {
      return activeAccount.address;
    }

    return evmToSubstrateAddress(activeAccount.address) ?? '';
  }, [activeAccount?.address]);

  const {
    data: currentPaymentDestination,
    error: currentPaymentDestinationError,
  } = usePaymentDestinationSubscription(substrateAddress);

  const continueToSignAndSubmitTx = payee;

  const closeModalAndReset = useCallback(() => {
    setIsUpdatePaymentDestinationTxLoading(false);
    setIsModalOpen(false);
    setPayee(StakingRewardsDestination.STAKED);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsUpdatePaymentDestinationTxLoading(true);

    try {
      await executeTx(
        () => updatePaymentDestinationEvm(walletAddress, payee),
        () =>
          updatePaymentDestinationSubstrate(rpcEndpoint, walletAddress, payee),
        `Successfully updated payment destination to ${payee}.`,
        'Failed to update payment destination!'
      );

      closeModalAndReset();
    } catch {
      setIsUpdatePaymentDestinationTxLoading(false);
    }
  }, [closeModalAndReset, executeTx, payee, rpcEndpoint, walletAddress]);

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
        <ModalHeader titleVariant="h4" onClose={closeModalAndReset}>
          Change Reward Destination
        </ModalHeader>

        <div className="px-8 py-6">
          <UpdatePayee
            currentPayee={currentPaymentDestination?.value1 ?? ''}
            payeeOptions={PAYMENT_DESTINATION_OPTIONS}
            payee={payee}
            setPayee={setPayee}
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
