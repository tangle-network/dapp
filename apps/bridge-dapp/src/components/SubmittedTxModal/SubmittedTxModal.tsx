import ShieldedCheckLineIcon from '@webb-tools/icons/ShieldedCheckLineIcon';
import { CopyWithTooltip } from '@webb-tools/webb-ui-components/components/CopyWithTooltip';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { SubmittedTxModalProps } from './types';

const SubmittedTxModal: FC<SubmittedTxModalProps> = ({
  txType = 'transaction',
  ...props
}) => {
  return (
    <Modal open>
      <ModalContent
        isOpen
        className="w-full max-w-md rounded-2xl bg-mono-0 dark:bg-mono-160"
      >
        <ModalHeader titleVariant="h4">
          {`${
            txType[0].toUpperCase() +
            (txType.length > 1 ? txType.substring(1) : '')
          } Submitted!`}
        </ModalHeader>

        <div className="flex flex-col gap-4 p-9">
          <ShieldedCheckLineIcon
            width={54}
            height={54}
            className="fill-green-70 dark:fill-green-30"
          />

          <Typography variant="body1">
            Please allow 5-20 minutes for the funds to arrive at destination
            address.
          </Typography>

          {'txExplorerUrl' in props ? (
            <Button
              target="_blank"
              href={props.txExplorerUrl.toString()}
              size="sm"
              variant="link"
              className="block"
            >
              Open Explorer
            </Button>
          ) : 'txHash' in props ? (
            <CopyWithTooltip textToCopy={props.txHash} />
          ) : null}
        </div>

        <ModalFooter className="px-8 py-6">
          <Button isFullWidth>Close</Button>
          <Button variant="secondary" isFullWidth>
            View Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SubmittedTxModal;
