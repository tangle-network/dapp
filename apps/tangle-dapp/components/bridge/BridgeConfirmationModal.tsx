import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { ChainConfig } from '@webb-tools/dapp-config/chains';
import { ChainIcon } from '@webb-tools/icons/ChainIcon';
import { TokenIcon } from '@webb-tools/icons/TokenIcon';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { Button } from '@webb-tools/webb-ui-components/components/buttons';
import {
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@webb-tools/webb-ui-components/components/Modal';
import { Typography } from '@webb-tools/webb-ui-components/typography';
import { shortenHex } from '@webb-tools/webb-ui-components/utils';
import cx from 'classnames';
import { FC, useCallback } from 'react';

import { FeeDetail } from '../../components/bridge/FeeDetail';
import { useRouterTransfer } from '../../hooks/bridge/useRouterTransfer';
import { BridgeTokenType } from '../../types/bridge/types';
import { useBridgeTxQueue } from '../../context/bridge/useBridgeTxQueue';

interface BridgeConfirmationModalProps {
  isOpen: boolean;
  handleClose: () => void;
  sourceChain: ChainConfig;
  destinationChain: ChainConfig;
  token: BridgeTokenType;
  feeDetails: {
    token: BridgeTokenType;
    amounts: {
      sending: string;
      receiving: string;
      bridgeFee: string;
    };
    estimatedTime: string;
  } | null;
  activeAccountAddress: string;
  destinationAddress: string;
  transferData: {
    routerQuoteData: any;
    fromTokenAddress: string;
    toTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    refundAddress: string;
  };
}

export const BridgeConfirmationModal = ({
  isOpen,
  handleClose,
  sourceChain,
  destinationChain,
  token,
  feeDetails,
  activeAccountAddress,
  destinationAddress,
  transferData,
}: BridgeConfirmationModalProps) => {
  const { mutate: transferByRouter } = useRouterTransfer({
    routerQuoteData: transferData.routerQuoteData,
    fromTokenAddress: transferData.fromTokenAddress,
    toTokenAddress: transferData.toTokenAddress,
    senderAddress: transferData.senderAddress,
    receiverAddress: transferData.receiverAddress,
    refundAddress: transferData.refundAddress,
  });

  const { addTxToQueue } = useBridgeTxQueue();

  const handleConfirm = useCallback(async () => {
    const res = await transferByRouter();
  }, [transferByRouter, addTxToQueue]);

  return (
    <Modal open>
      <ModalContent isOpen={isOpen} onInteractOutside={handleClose} size="md">
        <ModalHeader onClose={handleClose}>Bridge Confirmation</ModalHeader>

        <div className="p-9 space-y-8">
          <div className="flex flex-col items-center gap-3">
            <ConfirmationItem
              type="source"
              chainName={sourceChain.displayName ?? sourceChain.name}
              accAddress={activeAccountAddress ?? ''}
              amount={feeDetails?.amounts.sending ?? ''}
              tokenName={token.tokenType}
            />

            <ArrowDownIcon className="w-6 h-6" />

            <ConfirmationItem
              type="destination"
              chainName={destinationChain.displayName ?? destinationChain.name}
              accAddress={destinationAddress}
              amount={feeDetails?.amounts.receiving ?? ''}
              tokenName={token.tokenType}
            />
          </div>

          {feeDetails && (
            <FeeDetail
              token={feeDetails.token}
              estimatedTime={feeDetails.estimatedTime}
              amounts={feeDetails.amounts}
              className="bg-mono-20 dark:bg-mono-170 rounded-xl"
              showTitle={false}
            />
          )}
        </div>

        <ModalFooter className="flex items-center gap-2">
          <Button isFullWidth onClick={handleConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const ConfirmationItem: FC<{
  type: 'source' | 'destination';
  chainName: string;
  accAddress: string;
  amount: string;
  tokenName: string;
}> = ({ type, chainName, accAddress, amount, tokenName }) => {
  return (
    <div className="bg-mono-20 dark:bg-mono-170 w-full space-y-2 p-4 rounded-xl">
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          {type === 'source' ? 'From' : 'To'}
        </Typography>
        <div className="flex items-center gap-1.5">
          <ChainIcon
            name={chainName}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
          <Typography variant="h5" fw="bold" className="!text-lg">
            {chainName}
          </Typography>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          Account
        </Typography>
        <Typography variant="h5" fw="bold" className="!text-lg">
          {shortenHex(accAddress, 10)}
        </Typography>
      </div>
      <div className="flex justify-between items-center">
        <Typography variant="body1" className="!text-lg">
          Amount
        </Typography>
        <div className="flex items-center gap-1.5">
          <TokenIcon
            name={tokenName}
            size="lg"
            spinnerSize="lg"
            className={cx(`shrink-0 grow-0 ${getFlexBasic('lg')}`)}
          />
          <Typography variant="h5" fw="bold" className="!text-lg">
            {amount}
          </Typography>
        </div>
      </div>
    </div>
  );
};
