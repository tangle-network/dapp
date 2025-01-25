import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import {
  BridgeQueueTxItem,
  BridgeTxState,
} from '@webb-tools/tangle-shared-ui/types';
import { TxProgressor } from '@webb-tools/webb-ui-components/components/TxProgressor';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { Decimal } from 'decimal.js';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { useBridgeTxQueue } from '../../context/BridgeTxQueueContext';

interface BridgeTxQueueItemProps {
  tx: BridgeQueueTxItem;
  className?: string;
}

const BridgeTxQueueItem: FC<BridgeTxQueueItemProps> = ({ tx, className }) => {
  const { deleteTxFromQueue } = useBridgeTxQueue();

  return (
    <TxProgressor.Root
      key={tx.hash}
      className={twMerge('flex flex-col gap-1', className)}
    >
      <TxProgressor.Header name="Bridge" createdAt={tx.creationTimestamp} />
      <TxProgressor.Body
        txSourceInfo={{
          isSource: true,
          typedChainId: tx.sourceTypedChainId,
          amount: new Decimal(tx.sourceAmount).neg(),
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.sourceAddress,
        }}
        txDestinationInfo={{
          typedChainId: tx.destinationTypedChainId,
          amount: new Decimal(tx.destinationAmount),
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.recipientAddress,
        }}
      />
      <TxProgressor.Footer
        status={getStatus(tx.state)}
        statusMessage={getStatusMessage(tx.state)}
        steppedProgressProps={{
          steps: getTotalSteps(tx.bridgeType),
          activeStep: getActiveStep(tx.state),
        }}
        externalUrl={tx.explorerUrl ? new URL(tx.explorerUrl) : undefined}
        destinationTxStatus={
          tx.destinationTxState ? getStatus(tx.destinationTxState) : undefined
        }
        destinationTxStatusMessage={
          tx.destinationTxState
            ? getStatusMessage(tx.destinationTxState)
            : undefined
        }
        destinationTxExplorerUrl={
          tx.destinationTxExplorerUrl
            ? new URL(tx.destinationTxExplorerUrl)
            : undefined
        }
        actionCmp={
          <Typography
            variant="body2"
            onClick={() => {
              deleteTxFromQueue(tx.hash);
            }}
            className="text-right cursor-pointer text-red-70 dark:text-red-50"
          >
            Close
          </Typography>
        }
      />
    </TxProgressor.Root>
  );
};

export default BridgeTxQueueItem;

const getTotalSteps = (bridgeType: EVMTokenBridgeEnum): number => {
  return bridgeType === EVMTokenBridgeEnum.Router ? 2 : 2;
};

const getActiveStep = (state: BridgeTxState): number => {
  switch (state) {
    case BridgeTxState.Initializing:
      return 1;
    case BridgeTxState.Sending:
      return 2;
    case BridgeTxState.Executed:
      return 3;
    case BridgeTxState.Failed:
      return 3;
  }
};

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.Initializing:
      return 'info';
    case BridgeTxState.Sending:
      return 'info';
    case BridgeTxState.Executed:
      return 'success';
    case BridgeTxState.Failed:
      return 'error';
  }
};

const getStatusMessage = (state: BridgeTxState): string => {
  switch (state) {
    case BridgeTxState.Initializing:
      return 'Initializing';
    case BridgeTxState.Sending:
      return 'Sending';
    case BridgeTxState.Executed:
      return 'Executed';
    case BridgeTxState.Failed:
      return 'Failed';
  }
};
