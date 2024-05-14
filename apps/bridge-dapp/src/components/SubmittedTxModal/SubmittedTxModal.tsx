import { useModalQueueManager } from '@webb-tools/api-provider-environment/modal-queue-manager/index.js';
import { ExternalLinkLine } from '@webb-tools/icons';
import ShieldedCheckLineIcon from '@webb-tools/icons/ShieldedCheckLineIcon.js';
import { KeyValueWithButton } from '@webb-tools/webb-ui-components/components/KeyValueWithButton/index.js';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal/index.js';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button.js';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography/index.js';
import { type FC, useMemo } from 'react';
import { SubmittedTxModalProps } from './types.js';

const SubmittedTxModal: FC<SubmittedTxModalProps> = ({ txType, ...props }) => {
  const { dequeue } = useModalQueueManager();

  const isWrapperType = useMemo(
    () => txType && txType.includes('wrap'),
    [txType]
  );

  return (
    <Modal open>
      <ModalContent
        isCenter
        isOpen
        className="w-full max-w-md rounded-2xl bg-mono-0 dark:bg-mono-160"
      >
        <ModalHeader titleVariant="h4">
          {`${
            isWrapperType || txType === undefined
              ? 'Transaction'
              : txType.toUpperCase()
          } Submitted!`}
        </ModalHeader>

        <div className="flex flex-col gap-4 p-9">
          <ShieldedCheckLineIcon
            width={54}
            height={54}
            className="mx-auto fill-green-70 dark:fill-green-30"
          />

          <Typography variant="body1" ta="center">
            {isWrapperType
              ? `Your ${txType}ping request has successfully been queued.`
              : 'Please allow 5-20 minutes for the funds to arrive at destination address.'}
          </Typography>

          {'txExplorerUrl' in props && props.txExplorerUrl != null ? (
            <Button
              target="_blank"
              href={props.txExplorerUrl.toString()}
              size="sm"
              variant="link"
              className="mx-auto"
              rightIcon={<ExternalLinkLine className="!fill-current" />}
            >
              Open Explorer
            </Button>
          ) : 'txHash' in props ? (
            <KeyValueWithButton
              label="Transaction Hash"
              size="sm"
              className="mx-auto"
              keyValue={props.txHash}
            />
          ) : null}
        </div>

        <ModalFooter className="px-8 py-6">
          <Button isFullWidth onClick={() => dequeue()}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmittedTxModal;
