import { useWebContext } from '@tangle-network/api-provider-environment';
import {
  InputField,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@tangle-network/ui-components';
import { TANGLE_DOCS_STAKING_URL } from '@tangle-network/ui-components/constants';
import { type FC, useCallback, useEffect, useMemo } from 'react';

import { MAX_PAYOUTS_BATCH_SIZE } from '../data/payouts/usePayoutAllTx';
import usePayoutStakersTx from '../data/payouts/usePayoutStakersTx';
import { TxStatus } from '../hooks/useSubstrateTx';
import { PayoutTxProps } from './PayoutAllTxModal';
import { Payout } from '@tangle-network/tangle-shared-ui/types';

type Props = {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  payoutTxProps: PayoutTxProps;
  payouts: Payout[];
};

const PayoutTxModal: FC<Props> = ({
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

  // TODO: Why is the wallet address being used as a condition for readiness? Is it checking whether it's an empty string? Can it ever be an empty string?
  const isReady = walletAddress && executePayoutStakersTx !== null;

  const submitTx = useCallback(async () => {
    if (!isReady) {
      return;
    }

    await executePayoutStakersTx({
      era,
      validatorAddress,
    });
  }, [era, executePayoutStakersTx, isReady, validatorAddress]);

  // Automatically close the modal when the transaction is complete & successful.
  useEffect(() => {
    if (payoutStakersTxStatus === TxStatus.COMPLETE) {
      closeModal();
    }
  }, [closeModal, payoutStakersTxStatus]);

  return (
    <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
      <ModalContent size="lg">
        <ModalHeader>Payout Stakers</ModalHeader>

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
            <Typography variant="body1">
              Any account can request payout for stakers, this is not limited to
              accounts that will be rewarded.
            </Typography>

            <Typography variant="body1">
              All the listed validators and all their nominators will receive
              their rewards.
            </Typography>

            <Typography variant="body1">
              The UI puts a limit of {MAX_PAYOUTS_BATCH_SIZE} payouts at a time,
              where each payout is a single validator for a single era.
            </Typography>
          </div>
        </ModalBody>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={!isReady}
          isProcessing={payoutStakersTxStatus === TxStatus.PROCESSING}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxModal;
