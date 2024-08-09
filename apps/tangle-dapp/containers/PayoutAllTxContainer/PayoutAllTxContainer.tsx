'use client';

import {
  Button,
  InputField,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo } from 'react';

import usePayoutAllTx from '../../data/payouts/usePayoutAllTx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PayoutAllTxContainerProps } from './types';

const PayoutAllTxContainer: FC<PayoutAllTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  validatorsAndEras,
}) => {
  const substrateAddress = useSubstrateAddress();

  const allValidators = useMemo(() => {
    const uniqueValidatorAddresses = [
      // Use a set to filter out duplicate validator addresses.
      ...new Set(
        validatorsAndEras.map((payout) => payout.validatorSubstrateAddress),
      ),
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

  const submitTx = useCallback(async () => {
    if (executePayoutAllTx === null) {
      return;
    }

    await executePayoutAllTx({
      validatorEraPairs: validatorsAndEras,
    });

    closeModal();
  }, [executePayoutAllTx, validatorsAndEras, closeModal]);

  const canSubmitTx =
    validatorsAndEras.length > 0 && executePayoutAllTx !== null;

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[838px]"
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
          </div>
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button
            isFullWidth
            variant="secondary"
            href={TANGLE_DOCS_STAKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </Button>

          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={payoutAllTxStatus === TxStatus.PROCESSING}
            onClick={submitTx}
          >
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PayoutAllTxContainer;
