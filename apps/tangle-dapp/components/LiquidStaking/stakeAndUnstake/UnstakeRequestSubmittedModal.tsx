import { getExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { CheckboxCircleLine, WalletLineIcon } from '@webb-tools/icons';
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  TANGLE_DOCS_LIQUID_STAKING_URL,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { FC, useMemo } from 'react';
import { Hash } from 'viem';

import ModalIcon, { ModalIconCommonVariant } from '..//ModalIcon';
import ExternalLink from '../ExternalLink';

export type UnstakeRequestSubmittedModalProps = {
  isOpen: boolean;
  txHash: Hash | null;
  onClose: () => void;
};

const UnstakeRequestSubmittedModal: FC<UnstakeRequestSubmittedModalProps> = ({
  isOpen,
  txHash,
  onClose,
}) => {
  const viewExplorerHref = useMemo(() => {
    // The hash is not available, so the URL cannot be generated.
    if (txHash === null) {
      return null;
    }

    return getExplorerUrl(
      TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.polkadotJsDashboardUrl,
      txHash,
      'tx',
      'polkadot',
    );
  }, [txHash]);

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen={isOpen}
        className="w-full max-w-[calc(100vw-40px)] md:max-w-[500px]"
      >
        <ModalHeader onClose={onClose}>Unstake Request Submitted</ModalHeader>

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
            After the schedule period completes, you can withdraw unstaked
            tokens.
          </Typography>

          <ExternalLink href={TANGLE_DOCS_LIQUID_STAKING_URL}>
            Learn More
          </ExternalLink>
        </div>

        <ModalFooter className="flex items-center gap-2">
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

export default UnstakeRequestSubmittedModal;
