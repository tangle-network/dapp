'use client';

import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import { TxProgressor } from '@webb-tools/webb-ui-components/components/TxProgressor';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { FC, useEffect } from 'react';

import { useBridgeTxQueue } from '../../context/BridgeTxQueueContext';
import {
  BridgeQueueTxItem,
  BridgeTxState,
  BridgeType,
} from '../../types/bridge';

interface BridgeTxQueueItemProps {
  tx: BridgeQueueTxItem;
  className?: string;
}

const BridgeTxQueueItem: FC<BridgeTxQueueItemProps> = ({ tx, className }) => {
  const { updateTxState, addTxExplorerUrl, deleteTxFromQueue } =
    useBridgeTxQueue();

  useEffect(() => {
    // Hyperlane-specific logic can be added here if needed
  }, [tx.hash, updateTxState, addTxExplorerUrl]);

  return (
    <TxProgressor.Root key={tx.hash} className={className}>
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
          steps: getTotalSteps(tx.type),
          activeStep: getActiveStep(tx.state, tx.type),
        }}
        externalUrl={tx.explorerUrl ? new URL(tx.explorerUrl) : undefined}
        destinationTxStatus={getStatus(
          tx.destinationTxState ?? BridgeTxState.HyperlanePending,
        )}
        destinationTxStatusMessage={getStatusMessage(
          tx.destinationTxState ?? BridgeTxState.HyperlanePending,
        )}
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
            className="text-red-70 dark:text-red-50 cursor-pointer text-right"
          >
            Close
          </Typography>
        }
      />
    </TxProgressor.Root>
  );
};

export default BridgeTxQueueItem;

const getTotalSteps = (type: BridgeType) => {
  switch (type) {
    case BridgeType.HYPERLANE_EVM_TO_EVM:
      return 3; // 1.Initializing 2.Sending 3.Executed or Failed
    default:
      return 3;
  }
};

const getActiveStep = (state: BridgeTxState, type: BridgeType): number => {
  const isHyperlane = type === BridgeType.HYPERLANE_EVM_TO_EVM;

  switch (state) {
    case BridgeTxState.Initializing:
      return 1;
    case BridgeTxState.Sending:
      return 2;
    case BridgeTxState.Executed:
    case BridgeTxState.Failed:
      return 3;
    case BridgeTxState.HyperlanePending:
    case BridgeTxState.HyperlaneIndexing:
      return isHyperlane ? 2 : 1;
    case BridgeTxState.HyperlaneDelivered:
    case BridgeTxState.HyperlaneExecuted:
    case BridgeTxState.HyperlaneFailed:
      return isHyperlane ? 3 : 1;
    default:
      return 1;
  }
};

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.Initializing:
    case BridgeTxState.Sending:
    case BridgeTxState.Executed:
      return 'success';
    case BridgeTxState.Failed:
      return 'error';
    case BridgeTxState.HyperlanePending:
      return 'info';
    case BridgeTxState.HyperlaneIndexing:
      return 'info';
    case BridgeTxState.HyperlaneDelivered:
      return 'warning';
    case BridgeTxState.HyperlaneExecuted:
      return 'success';
    case BridgeTxState.HyperlaneFailed:
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
    case BridgeTxState.HyperlanePending:
      return 'Pending';
    case BridgeTxState.HyperlaneIndexing:
      return 'Indexing';
    case BridgeTxState.HyperlaneDelivered:
      return 'Delivered';
    case BridgeTxState.HyperlaneExecuted:
      return 'Executed';
    case BridgeTxState.HyperlaneFailed:
      return 'Failed';
  }
};
