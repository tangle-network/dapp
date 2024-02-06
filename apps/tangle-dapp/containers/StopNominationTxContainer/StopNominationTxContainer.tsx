'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { isSubstrateAddress } from '@webb-tools/dapp-types';
import { ProhibitedLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { WEBB_TANGLE_DOCS_STAKING_URL } from '@webb-tools/webb-ui-components/constants';
import Link from 'next/link';
import { type FC, useCallback, useMemo, useState } from 'react';

import useDelegations from '../../data/DelegationsPayouts/useDelegations';
import useExecuteTxWithNotification from '../../hooks/useExecuteTxWithNotification';
import { convertToSubstrateAddress } from '../../utils';
import { stopNomination as stopNominationEvm } from '../../utils/evm';
import { stopNomination as stopNominationSubstrate } from '../../utils/polkadot';
import { StopNominationTxContainerProps } from './types';

const StopNominationTxContainer: FC<StopNominationTxContainerProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { activeAccount } = useWebContext();
  const executeTx = useExecuteTxWithNotification();

  const [isStopNominationTxLoading, setIsStopNominationTxLoading] =
    useState<boolean>(false);

  const walletAddress = useMemo(() => {
    if (!activeAccount?.address) return '0x0';

    return activeAccount.address;
  }, [activeAccount?.address]);

  const substrateAddress = useMemo(() => {
    if (!activeAccount?.address) return '';

    if (isSubstrateAddress(activeAccount?.address))
      return activeAccount.address;

    return convertToSubstrateAddress(activeAccount.address) ?? '';
  }, [activeAccount?.address]);

  const { data: delegatorsData } = useDelegations(substrateAddress);

  const userHasActiveNominations = useMemo(() => {
    return delegatorsData?.delegators.length === 0 ? false : true;
  }, [delegatorsData?.delegators]);

  const closeModal = useCallback(() => {
    setIsStopNominationTxLoading(false);
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  const submitAndSignTx = useCallback(async () => {
    setIsStopNominationTxLoading(true);

    try {
      await executeTx(
        () => stopNominationEvm(walletAddress),
        () => stopNominationSubstrate(walletAddress),
        `Successfully stopped nomination!`,
        'Failed to stop nomination!'
      );
    } catch {
      // notification is already handled in executeTx
    } finally {
      closeModal();
    }
  }, [closeModal, executeTx, walletAddress]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={closeModal} className="mb-4">
          Stop Nominations
        </ModalHeader>

        <div className="block m-auto p-9">
          <ProhibitedLineIcon className="m-auto fill-blue-50 dark:fill-blue-50" />

          <Typography variant="body1" className="mt-4 text-center">
            Are you sure you want to stop all staking activities? You will be
            removed from current validator nominations and cease rewards from
            the next era, your tokens will stay bonded.
          </Typography>
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button
            isFullWidth
            isDisabled={!userHasActiveNominations}
            isLoading={isStopNominationTxLoading}
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

export default StopNominationTxContainer;
