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

import { useBridgeTxQueue } from '../../context/bridge/BridgeTxQueueContext';

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
        className="py-2"
      />
      <TxProgressor.Footer
        status={getStatus(tx.state)}
        statusMessage={getStatusMessage(tx.state, false, tx.bridgeType)}
        externalUrl={tx.explorerUrl ? new URL(tx.explorerUrl) : undefined}
        destinationTxStatus={
          tx.destinationTxState ? getStatus(tx.destinationTxState) : undefined
        }
        destinationTxStatusMessage={
          tx.destinationTxState
            ? getStatusMessage(tx.destinationTxState, true, tx.bridgeType)
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

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.Pending:
      return 'info';
    case BridgeTxState.Completed:
      return 'success';
    case BridgeTxState.Failed:
      return 'error';
  }
};

const getStatusMessage = (
  state: BridgeTxState,
  isDestinationTx: boolean,
  bridgeType: EVMTokenBridgeEnum,
): string => {
  const TxType =
    bridgeType === EVMTokenBridgeEnum.Hyperlane
      ? isDestinationTx
        ? 'on destination'
        : 'on source'
      : '';

  switch (state) {
    case BridgeTxState.Pending:
      return `Pending ${TxType} `;
    case BridgeTxState.Completed:
      return `Successful ${TxType} `;
    case BridgeTxState.Failed:
      return `Failed ${TxType} `;
  }
};
