'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Button,
  InputField,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo } from 'react';

import usePayoutStakersTx from '../../data/payouts/usePayoutStakersTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PayoutTxContainerProps } from './types';

const PayoutTxContainer: FC<PayoutTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  payoutTxProps: { validatorAddress, era },
  payouts,
  updatePayouts,
}) => {
  const { activeAccount } = useWebContext();

  const walletAddress = useMemo(() => {
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

    const updatedPayouts = payouts.filter(
      (payout) =>
        !(
          payout.era === Number(era) &&
          payout.validator.address === validatorAddress
        ),
    );

    updatePayouts(updatedPayouts);
    closeModal();
  }, [
    closeModal,
    era,
    executePayoutStakersTx,
    payouts,
    updatePayouts,
    validatorAddress,
  ]);

  // TODO: This validation doesn't make much sense because the values are never null or undefined, so why are they being used as booleans? In fact, the variable's inferred type is not a boolean.
  const canSubmitTx =
    walletAddress && validatorAddress && era && executePayoutStakersTx !== null;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[838px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal}>
          Payout Stakers
        </ModalHeader>

        <div className="grid grid-cols-2 gap-9 p-9">
          <div className="flex flex-col gap-9">
            {/* Initiator */}
            <InputField.Root>
              <InputField.Input
                title="Request Payout From"
                isAddressType={true}
                value={walletAddress}
                type="text"
                readOnly
              />
            </InputField.Root>

            {/* Validator */}
            <InputField.Root>
              <InputField.Input
                title="Payout Stakers For"
                isAddressType={true}
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
              The UI puts a limit of 40 payouts at a time, where each payout is
              a single validator for a single era.
            </Typography>
          </div>
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={payoutStakersTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
          >
            Confirm
          </Button>

          <a
            href={WEBB_TANGLE_DOCS_STAKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button isFullWidth variant="secondary">
              Learn More
            </Button>
          </a>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PayoutTxContainer;
