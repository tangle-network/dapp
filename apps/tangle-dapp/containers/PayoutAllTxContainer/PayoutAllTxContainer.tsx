'use client';

import {
  InputField,
  Modal,
  ModalContent,
  ModalFooterActions,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useEffect, useMemo } from 'react';

import usePayoutAllTx, {
  MAX_PAYOUTS_BATCH_SIZE,
} from '../../data/payouts/usePayoutAllTx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PayoutAllTxContainerProps } from './types';

const PayoutAllTxContainer: FC<PayoutAllTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  validatorsAndEras,
  onComplete,
}) => {
  const substrateAddress = useSubstrateAddress();

  const allValidators = useMemo(() => {
    const uniqueValidatorAddresses = [
      // Use a set to filter out duplicate validator addresses.
      ...new Set(validatorsAndEras.map((payout) => payout.validatorAddress)),
    ];

    return uniqueValidatorAddresses;
  }, [validatorsAndEras]);

  const eraRange = useMemo(() => {
    const eras = [...new Set(validatorsAndEras.map((payout) => payout.era))];

    return [eras[0], eras[eras.length - 1]];
  }, [validatorsAndEras]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const { execute: executePayoutAllTx, status: payoutAllTxStatus } =
    usePayoutAllTx();

  // Automatically close the modal when the transaction is successful.
  useEffect(() => {
    if (payoutAllTxStatus === TxStatus.COMPLETE) {
      closeModal();
      onComplete();
    }
  }, [closeModal, onComplete, payoutAllTxStatus]);

  const submitTx = useCallback(async () => {
    if (executePayoutAllTx === null) {
      return;
    }

    await executePayoutAllTx({
      validatorEraPairs: validatorsAndEras,
    });
  }, [executePayoutAllTx, validatorsAndEras]);

  const canSubmitTx =
    validatorsAndEras.length > 0 && executePayoutAllTx !== null;

  return (
    <Modal open>
      <ModalContent
        onInteractOutside={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        size="lg"
      >
        <ModalHeader onClose={closeModal}>Payout Stakers</ModalHeader>

        <div className="grid grid-cols-2 gap-9 p-9">
          <div className="flex flex-col gap-9">
            {/* Initiator */}
            <InputField.Root>
              <InputField.Input
                title="Request Payout From"
                isAddressType
                value={substrateAddress ?? 'Loading...'}
                type="text"
                readOnly
              />
            </InputField.Root>

            <ScrollArea className="flex-1 max-h-64">
              <div className="space-y-2">
                {allValidators.map((validator) => (
                  <InputField.Root key={validator}>
                    <InputField.Input
                      title="Validator"
                      isAddressType
                      addressTheme="substrate"
                      value={validator}
                      type="text"
                      readOnly
                    />
                  </InputField.Root>
                ))}
              </div>
            </ScrollArea>

            {/* Eras */}
            {eraRange.length > 0 && (
              <InputField.Root>
                <InputField.Input
                  title="Request Payout for Eras"
                  isAddressType={false}
                  value={
                    eraRange[0] === eraRange[1]
                      ? eraRange[0]
                      : `${eraRange[0]} - ${eraRange[1]}`
                  }
                  type="text"
                  readOnly
                />
              </InputField.Root>
            )}
          </div>

          <div className="flex flex-col gap-16">
            <Typography variant="body1" fw="normal">
              Any account can request payout for stakers, this is not limited to
              accounts that will be rewarded.
            </Typography>

            <Typography variant="body1" fw="normal">
              All the listed validators and all their nominators will receive
              their rewards.
            </Typography>

            <Typography variant="body1" fw="normal">
              At most, {MAX_PAYOUTS_BATCH_SIZE} payouts can be requested at a
              time. If you have more than {MAX_PAYOUTS_BATCH_SIZE} pending
              payouts, click on the Payout All button multiple times.
            </Typography>
          </div>
        </div>

        <ModalFooterActions
          learnMoreLinkHref={TANGLE_DOCS_STAKING_URL}
          isConfirmDisabled={!canSubmitTx}
          isProcessing={payoutAllTxStatus === TxStatus.PROCESSING}
          onConfirm={submitTx}
        />
      </ModalContent>
    </Modal>
  );
};

export default PayoutAllTxContainer;
