import { HexString } from '@polkadot/util/types';
import { CheckboxCircleLine, WalletLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useMemo } from 'react';

import useExplorerUrl from '../../../hooks/useExplorerUrl';
import ModalIcon, { ModalIconCommonVariant } from '..//ModalIcon';

export type WithdrawalConfirmationModalProps = {
  isOpen: boolean;
  txHash: HexString | null;
  onClose: () => void;
};

const WithdrawalConfirmationModal: FC<WithdrawalConfirmationModalProps> = ({
  isOpen,
  txHash,
  onClose,
}) => {
  const getExplorerUrl = useExplorerUrl();

  const viewExplorerHref = useMemo(() => {
    // The hash is not available, so the URL cannot be generated.
    if (txHash === null) {
      return null;
    }

    return getExplorerUrl(
      txHash,
      'tx',
      undefined,
      TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
      true,
    );
  }, [getExplorerUrl, txHash]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px] rounded-2xl bg-mono-0 dark:bg-mono-180"
      >
        <ModalHeader titleVariant="h4" onClose={onClose}>
          Withdrawal Success
        </ModalHeader>

        <div className="flex flex-col items-center justify-center gap-2 p-9">
          <ModalIcon
            commonVariant={ModalIconCommonVariant.SUCCESS}
            Icon={CheckboxCircleLine}
          />

          <Typography
            className="dark:text-mono-0 text-center"
            variant="body1"
            fw="normal"
          >
            The tokens are now available in your wallet.
          </Typography>
        </div>

        <ModalFooter className="flex px-8 py-6 space-y-0">
          <Button
            href={viewExplorerHref?.toString()}
            // In case that the explorer URL could not be obtained,
            // disable the button.
            isDisabled={viewExplorerHref === null}
            isFullWidth
            variant="primary"
            rightIcon={<WalletLineIcon />}
          >
            View Explorer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default WithdrawalConfirmationModal;
