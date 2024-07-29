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
import { ScrollArea } from '@webb-tools/webb-ui-components/components/ScrollArea';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import { type FC, useCallback, useMemo } from 'react';

import usePayoutAllTx from '../../data/payouts/usePayoutAllTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import { PayoutAllTxContainerProps } from './types';

const PayoutAllTxContainer: FC<PayoutAllTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  validatorsAndEras,
}) => {
  const { activeAccount } = useWebContext();

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const payoutValidatorsAndEras = useMemo(
    () => validatorsAndEras.slice(0, 10),
    [validatorsAndEras],
  );

  const allValidators = useMemo(
    () => [
      ...new Set(
        payoutValidatorsAndEras.map((v) => v.validatorSubstrateAddress),
      ),
    ],
    [payoutValidatorsAndEras],
  );

  const eraRange = useMemo(() => {
    const eras = [...new Set(payoutValidatorsAndEras.map((v) => v.era))];

    return [eras[0], eras[eras.length - 1]];
  }, [payoutValidatorsAndEras]);

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
      validatorEraPairs: payoutValidatorsAndEras,
    });

    closeModal();
  }, [executePayoutAllTx, payoutValidatorsAndEras, closeModal]);

  const canSubmitTx =
    validatorsAndEras.length > 0 && executePayoutAllTx !== null;

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

            <ScrollArea className="flex-1 max-h-64">
              <div className="space-y-2">
                {allValidators.map((validator) => (
                  <InputField.Root key={validator}>
                    <InputField.Input
                      title="Validator"
                      isAddressType={true}
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
              The UI puts a limit of 10 payouts at a time, where each payout is
              a single validator for a single era.
            </Typography>
          </div>
        </div>

        <ModalFooter className="flex flex-col gap-1 px-8 py-6">
          <Button
            isFullWidth
            isDisabled={!canSubmitTx}
            isLoading={payoutAllTxStatus === TxStatus.PROCESSING}
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

export default PayoutAllTxContainer;
