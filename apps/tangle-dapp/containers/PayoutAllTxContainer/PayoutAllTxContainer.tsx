'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isViemError } from '@webb-tools/web3-api-provider';
import {
  Button,
  InputField,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import { batchPayoutStakers, evmPublicClient } from '../../constants';
import { PayoutAllTxContainerProps } from './types';

const PayoutAllTxContainer: FC<PayoutAllTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  validatorsAndEras,
  payouts,
  updatePayouts,
}) => {
  const { notificationApi } = useWebbUI();
  const { activeAccount } = useWebContext();

  const [isPayoutAllTxLoading, setIsPayoutAllTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const continueToSignAndSubmitTx = useMemo(() => {
    return validatorsAndEras.length > 0;
  }, [validatorsAndEras]);

  const payoutValidatorsAndEras = useMemo(() => {
    return validatorsAndEras.slice(0, 10);
  }, [validatorsAndEras]);

  const allValidators = useMemo(() => {
    return [...new Set(payoutValidatorsAndEras.map((v) => v.validatorAddress))];
  }, [payoutValidatorsAndEras]);

  const eraRange = useMemo(() => {
    const eras = [...new Set(payoutValidatorsAndEras.map((v) => v.era))];

    return [eras[0], eras[eras.length - 1]];
  }, [payoutValidatorsAndEras]);

  const closeModal = useCallback(() => {
    setIsPayoutAllTxLoading(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsPayoutAllTxLoading(true);

    try {
      const payoutAllTxHash = await batchPayoutStakers(
        walletAddress,
        payoutValidatorsAndEras
      );

      if (!payoutAllTxHash) {
        throw new Error('Failed to payout all stakers!');
      }

      const payoutAllTx = await evmPublicClient.waitForTransactionReceipt({
        hash: payoutAllTxHash,
      });

      if (payoutAllTx.status !== 'success') {
        throw new Error('Failed to payout all stakers!');
      }

      const updatedPayouts = payouts.filter(
        (payout) =>
          !payoutValidatorsAndEras.find(
            (v) =>
              v.validatorAddress === payout.validator.address &&
              v.era === payout.era.toString()
          )
      );

      updatePayouts(updatedPayouts);

      notificationApi({
        variant: 'success',
        message: `Successfully claimed rewards for all stakers!`,
      });
    } catch (error: any) {
      notificationApi({
        variant: 'error',
        message: isViemError(error)
          ? error.shortMessage
          : error.message || 'Something went wrong!',
      });
    } finally {
      closeModal();
    }
  }, [
    walletAddress,
    payoutValidatorsAndEras,
    payouts,
    updatePayouts,
    notificationApi,
    closeModal,
  ]);

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

            <div className="flex flex-col gap-2">
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

            {/* Eras */}
            {eraRange.length > 0 && (
              <InputField.Root>
                <InputField.Input
                  title="Request Payout for Eras"
                  isAddressType={false}
                  value={`${eraRange[0]} - ${eraRange[1]}`}
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
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isPayoutAllTxLoading}
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

export default PayoutAllTxContainer;
