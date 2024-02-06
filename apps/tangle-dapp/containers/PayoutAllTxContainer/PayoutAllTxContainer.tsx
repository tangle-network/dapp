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
import { type FC, useCallback, useMemo, useState } from 'react';

import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import {
  batchPayoutStakers as batchPayoutStakersEvm,
  evmPublicClient,
} from '../../utils/evm';
import { batchPayoutStakers as batchPayoutStakersSubstrate } from '../../utils/polkadot';
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
  const executeTx = useExecuteTxWithNotification();

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
      await executeTx(
        () => batchPayoutStakersEvm(walletAddress, payoutValidatorsAndEras),
        () =>
          batchPayoutStakersSubstrate(walletAddress, payoutValidatorsAndEras),
        `Successfully claimed rewards for all stakers!`,
        'Failed to payout all stakers!'
      );

      const updatedPayouts = payouts.filter(
        (payout) =>
          !payoutValidatorsAndEras.find(
            (v) =>
              v.validatorAddress === payout.validator.address &&
              v.era === payout.era.toString()
          )
      );

      updatePayouts(updatedPayouts);
    } catch {
      // notification is already handled in executeTx
    } finally {
      closeModal();
    }
  }, [
    executeTx,
    payouts,
    updatePayouts,
    walletAddress,
    payoutValidatorsAndEras,
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
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isPayoutAllTxLoading}
            onClick={submitAndSignTx}
          >
            Confirm
          </Button>

          <a href={WEBB_TANGLE_DOCS_STAKING_URL} target="_blank">
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
