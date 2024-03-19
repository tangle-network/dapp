'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
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
import { type FC, useCallback, useMemo, useState } from 'react';

import { useTxConfirmationModal } from '../../context/TxConfirmationContext';
import useRpcEndpointStore from '../../context/useRpcEndpointStore';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { payoutStakers as payoutStakersEvm } from '../../utils/evm';
import { payoutStakers as payoutStakersSubstrate } from '../../utils/polkadot';
import { PayoutTxContainerProps } from './types';

const PayoutTxContainer: FC<PayoutTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
  payoutTxProps,
  payouts,
  updatePayouts,
}) => {
  const { activeAccount } = useWebContext();
  const { validatorAddress, era } = payoutTxProps;
  const executeTx = useExecuteTxWithNotification();
  const { setTxConfirmationState } = useTxConfirmationModal();
  const { rpcEndpoint } = useRpcEndpointStore();
  const [isPayoutTxLoading, setIsPayoutTxLoading] = useState(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) {
      return '0x0';
    }

    return activeAccount.address;
  }, [activeAccount?.address]);

  const continueToSignAndSubmitTx = walletAddress && validatorAddress && era;

  const closeModal = useCallback(() => {
    setIsPayoutTxLoading(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsPayoutTxLoading(true);

    try {
      const hash = await executeTx(
        () => payoutStakersEvm(walletAddress, validatorAddress, Number(era)),
        () =>
          payoutStakersSubstrate(
            rpcEndpoint,
            walletAddress,
            validatorAddress,
            Number(era)
          ),
        `Successfully claimed rewards for Era ${era}.`,
        'Failed to payout stakers!'
      );

      const updatedPayouts = payouts.filter(
        (payout) =>
          !(
            payout.era === Number(era) &&
            payout.validator.address === validatorAddress
          )
      );

      updatePayouts(updatedPayouts);

      setTxConfirmationState({
        isOpen: true,
        status: 'success',
        hash,
        txType: isSubstrateAddress(validatorAddress) ? 'substrate' : 'evm',
      });
    } catch {
      setTxConfirmationState({
        isOpen: true,
        status: 'error',
        hash: '',
        txType: isSubstrateAddress(validatorAddress) ? 'substrate' : 'evm',
      });
    } finally {
      closeModal();
    }
  }, [
    closeModal,
    era,
    executeTx,
    payouts,
    rpcEndpoint,
    setTxConfirmationState,
    updatePayouts,
    validatorAddress,
    walletAddress,
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
            isDisabled={!continueToSignAndSubmitTx}
            isLoading={isPayoutTxLoading}
            onClick={submitAndSignTx}
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
