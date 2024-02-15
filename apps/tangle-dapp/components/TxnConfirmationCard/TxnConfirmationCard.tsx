'use client';

import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';
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
import { TANGLE_TESTNET_EXPLORER_URL } from '@webb-tools/webb-ui-components/constants';
import { useCallback, useMemo } from 'react';

import { TxnConfirmationModalProps } from './types';

export const TxnConfirmationModal = (props: TxnConfirmationModalProps) => {
  const { isModalOpen, setIsModalOpen, txnStatus, txnHash, txnType } = props;

  const { apiConfig } = useWebContext();

  const txExplorerUrl = useMemo(() => {
    if (!txnHash) return null;

    if (txnType === 'evm') {
      return `${TANGLE_TESTNET_EXPLORER_URL}/tx/${txnHash}`;
    } else {
      const explorer =
        apiConfig.chains[PresetTypedChainId.TangleTestnetNative]?.blockExplorers
          ?.default?.url;

      if (!explorer) return null;

      return getExplorerURI(explorer, txnHash, 'tx', 'polkadot');
    }
  }, [apiConfig.chains, txnHash, txnType]);

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
          Transaction {txnStatus === 'success' ? 'Successful' : 'Failed'}
        </ModalHeader>

        <div className="flex flex-col gap-4 p-9">
          {txnStatus === 'success' ? (
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
            {txnStatus === 'success'
              ? 'Your transaction has been submitted to the network.'
              : 'Your transaction has failed to be submitted to the network.'}
          </Typography>
        </div>

        <ModalFooter className="px-8 py-6 flex flex-col gap-1">
          <Button isFullWidth isDisabled={false} onClick={() => closeModal()}>
            Close
          </Button>

          {txExplorerUrl ? (
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
          ) : txnHash ? (
            <KeyValueWithButton
              label="Transaction Hash"
              size="sm"
              className="mx-auto"
              keyValue={txnHash}
            />
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};