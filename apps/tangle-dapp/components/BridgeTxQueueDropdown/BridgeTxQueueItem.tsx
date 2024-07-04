'use client';

import {
  Environment,
  getTransferStatusData,
  TransferStatusResponse,
} from '@buildwithsygma/sygma-sdk-core';
import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import { TxProgressor } from '@webb-tools/webb-ui-components/components/TxProgressor';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useEffect } from 'react';

import { useBridgeTxQueue } from '../../context/BridgeTxQueueContext';
import { BridgeQueueTxItem, BridgeTxState } from '../../types/bridge';

interface BridgeTxQueueItemProps {
  tx: BridgeQueueTxItem;
  className?: string;
}

const BridgeTxQueueItem: FC<BridgeTxQueueItemProps> = ({ tx, className }) => {
  const { updateTxState, addTxExplorerUrl, deleteTxFromQueue } =
    useBridgeTxQueue();

  useEffect(() => {
    const sygmaTxId = tx.sygmaTxId;
    if (sygmaTxId === undefined) return;

    let interval: ReturnType<typeof setTimeout> | undefined = undefined;

    const getTxStatus = () => {
      getSygmaTxStatus(
        sygmaTxId,
        tx.env === 'live'
          ? Environment.MAINNET
          : tx.env === 'test'
            ? Environment.TESTNET
            : Environment.DEVNET,
      )
        .then((data) => {
          if (data && data[0]) {
            const status = data[0].status;
            if (status === 'executed') {
              updateTxState(tx.hash, BridgeTxState.Executed);
              clearInterval(interval);
            } else if (status === 'pending') {
              updateTxState(tx.hash, BridgeTxState.Pending);
              clearInterval(interval);
            } else if (status === 'failed') {
              updateTxState(tx.hash, BridgeTxState.Failed);
              clearInterval(interval);
            }
            addTxExplorerUrl(tx.hash, data[0].explorerUrl);
          }
        })
        .catch(() => {
          updateTxState(tx.hash, BridgeTxState.Failed);
          clearInterval(interval); // Clear interval on error to avoid repeated failures.
        });
    };

    // Run for the first time when the component is mounted
    getTxStatus();

    // Set interval to run getTxStatus every 5 seconds
    interval = setInterval(() => {
      getTxStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [tx.sygmaTxId, tx.env, tx.hash, updateTxState, addTxExplorerUrl]);

  return (
    <TxProgressor.Root key={tx.sygmaTxId} className={className}>
      <TxProgressor.Header name="Bridge" createdAt={tx.creationTimestamp} />
      <TxProgressor.Body
        txSourceInfo={{
          isSource: true,
          typedChainId: tx.sourceTypedChainId,
          amount: -tx.sourceAmount,
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.sourceAddress,
        }}
        txDestinationInfo={{
          typedChainId: tx.destinationTypedChainId,
          amount: +tx.destinationAmount,
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.recipientAddress,
        }}
      />
      <TxProgressor.Footer
        status={getStatus(tx.state)}
        statusMessage={tx.state}
        steppedProgressProps={{
          steps: 4, // 1.Sending, 2.Indexing, 3.Pending, 4.Executed or Failed
          activeStep: getActiveStep(tx.state),
        }}
        externalUrl={tx.explorerUrl ? new URL(tx.explorerUrl) : undefined}
        actionCmp={
          <Typography
            variant="body2"
            onClick={() => {
              deleteTxFromQueue(tx.hash);
            }}
            className="text-red-70 dark:text-red-50 cursor-pointer"
          >
            Close
          </Typography>
        }
      />
    </TxProgressor.Root>
  );
};

export default BridgeTxQueueItem;

const getActiveStep = (state: BridgeTxState) => {
  switch (state) {
    case BridgeTxState.Sending:
      return 1;
    case BridgeTxState.Indexing:
      return 2;
    case BridgeTxState.Pending:
      return 3;
    case BridgeTxState.Executed:
      return 4;
    case BridgeTxState.Failed:
      return 4;
  }
};

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.Sending:
    case BridgeTxState.Indexing:
    case BridgeTxState.Pending:
      return 'info';
    case BridgeTxState.Executed:
      return 'success';
    case BridgeTxState.Failed:
      return 'error';
  }
};

const getSygmaTxStatus = async (
  txHash: string,
  env: Environment,
): Promise<TransferStatusResponse[]> => {
  const data = await getTransferStatusData(env, txHash);
  return data as TransferStatusResponse[];
};
