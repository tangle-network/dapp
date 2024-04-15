'use client';

import {
  ExternalLinkLine,
  ShieldedCheckLineIcon,
  SpamLineIcon,
} from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton';
import { FC, useCallback } from 'react';

import useExplorerUrl from '../../hooks/useExplorerUrl';
import { ExplorerType } from '../../types';
import { TxConfirmationModalProps } from './types';

export const TxConfirmationModal: FC<TxConfirmationModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  txStatus,
  txHash,
  txType,
}) => {
  const getExplorerUrl = useExplorerUrl();

  const txExplorerUrl = getExplorerUrl(
    txHash,
    txType === 'evm' ? ExplorerType.EVM : ExplorerType.Substrate
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, [setIsModalOpen]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isModalOpen}
        className="w-full max-w-[416px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader
          titleVariant="h4"
          onClose={closeModal}
          className="p-9 pb-4"
        >
          Transaction {txStatus === 'success' ? 'Successful' : 'Failed'}
        </ModalHeader>

        <div className="flex flex-col gap-4 p-9">
          {txStatus === 'success' ? (
            <ShieldedCheckLineIcon
              width={54}
              height={54}
              className="mx-auto fill-green-70 dark:fill-green-30"
            />
          ) : (
            <SpamLineIcon
              width={54}
              height={54}
              className="mx-auto fill-red-50 dark:fill-red-10"
            />
          )}

          <Typography variant="body1" className="w-[344px]" ta="center">
            {txStatus === 'success'
              ? 'Your transaction has been submitted to the network.'
              : 'Your transaction has failed to be submitted to the network.'}
          </Typography>
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button isFullWidth isDisabled={false} onClick={() => closeModal()}>
            Close
          </Button>

          {txExplorerUrl !== null ? (
            <Button
              variant="secondary"
              isFullWidth
              isDisabled={false}
              href={txExplorerUrl.toString()}
              target="_blank"
              rel="noopener noreferrer"
              rightIcon={<ExternalLinkLine width={24} height={24} />}
            >
              Open Explorer
            </Button>
          ) : txHash ? (
            <KeyValueWithButton
              label="Transaction Hash"
              size="sm"
              className="mx-auto"
              keyValue={txHash}
            />
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
