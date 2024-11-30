'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  InputField,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo } from 'react';

import { MAX_PAYOUTS_BATCH_SIZE } from '../../data/payouts/usePayoutAllTx';
import usePayoutStakersTx from '../../data/payouts/usePayoutStakersTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PayoutTxContainerProps } from './types';

const PayoutTxContainer: FC<PayoutTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  payoutTxProps: { validatorAddress, era },
}) => {
  const { activeAccount } = useWebContext();

  const walletAddress = useMemo(() => {
    // TODO: Don't default to dummy addresses in order to circumvent the type system.
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const { execute: executePayoutStakersTx, status: payoutStakersTxStatus } =
    usePayoutStakersTx();

  const submitTx = useCallback(async () => {
    if (executePayoutStakersTx === null) {
      return;
    }

    await executePayoutStakersTx({
      era,
      validatorAddress,
    });

    closeModal();
  }, [closeModal, era, executePayoutStakersTx, validatorAddress]);

  // TODO: This validation doesn't make much sense because the values are never null or undefined, so why are they being used as booleans? In fact, the variable's inferred type is not a boolean.
  const canSubmitTx =
    walletAddress && validatorAddress && era && executePayoutStakersTx !== null;

  return (
    <Modal open>
      <ModalContent
        onInteractOutside={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        size="lg"
      >
        <ModalHeader onClose={closeModal}>Payout Stakers</ModalHeader>

        <ModalBody className="grid grid-cols-2 gap-9">
          <div className="flex flex-col gap-9">
            {/* Initiator */}
            <InputField.Root>
              <InputField.Input
                title="Request Payout From"
                isAddressType
                value={walletAddress}
                type="text"
                readOnly
              />
            </InputField.Root>

            {/* Validator */}
            <InputField.Root>
              <InputField.Input
                title="Payout Stakers For"
                isAddressType
                addressTheme="substrate"
                value={validatorAddress}
                type="text"
                readOnly
              />
            </InputField.Root>

            {/* Era */}
            <InputField.Root>
              <InputField.Input
                title="Request Payout for Era"
                isAddressType={false}
                value={era}
                type="number"
                readOnly
              />
            </InputField.Root>
          </div>

          <div className="flex flex-col gap-9">
            <Typography variant="body1" fw="normal">
              Any account can request payout for stakers, this is not limited to
              accounts that will be rewarded.
            </Typography>

            <Typography variant="body1" fw="normal">
              All the listed validators and all their nominators will receive
              their rewards.
            </Typography>

            <Typography variant="body1" fw="normal">
              The UI puts a limit of {MAX_PAYOUTS_BATCH_SIZE} payouts at a time,
              where each payout is a single validator for a single era.
            </Typography>
          </div>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={!canSubmitTx}
          isProcessing={payoutStakersTxStatus === TxStatus.PROCESSING}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxContainer;
