'use client';

import {
  Environment,
  getTransferStatusData,
  TransferStatusResponse,
} from '@buildwithsygma/sygma-sdk-core';
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
              updateTxState(tx.hash, BridgeTxState.SygmaPending);
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
        statusMessage={tx.state}
        steppedProgressProps={{
          steps: getTotalSteps(tx.type),
          activeStep: getActiveStep(tx.state, tx.type),
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

const getTotalSteps = (type: BridgeType) => {
  switch (type) {
    case BridgeType.HYPERLANE_EVM_TO_EVM:
      return 3; // 1.Initializing 2.Sending 3.Executed or Failed
    case BridgeType.SYGMA_EVM_TO_EVM:
    case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
    case BridgeType.SYGMA_EVM_TO_SUBSTRATE:
    case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
      return 5; // 1.Initializing 2.Sending 3.Indexing 4.Pending 5.Executed or Failed
  }
};

const getActiveStep = (state: BridgeTxState, type: BridgeType): number => {
  const isSygma =
    type === BridgeType.SYGMA_EVM_TO_EVM ||
    type === BridgeType.SYGMA_SUBSTRATE_TO_EVM ||
    type === BridgeType.SYGMA_EVM_TO_SUBSTRATE ||
    type === BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE;

  switch (state) {
    case BridgeTxState.Initializing:
      return 1;
    case BridgeTxState.Sending:
      return 2;
    case BridgeTxState.SygmaIndexing: {
      if (!isSygma) throw new Error('Invalid state for non-Sygma tx');
      return 3;
    }
    case BridgeTxState.SygmaPending: {
      if (!isSygma) throw new Error('Invalid state for non-Sygma tx');
      return 4;
    }
    case BridgeTxState.Executed:
    case BridgeTxState.Failed:
      return isSygma ? 5 : 3;
  }
};

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.Initializing:
    case BridgeTxState.Sending:
    case BridgeTxState.SygmaIndexing:
    case BridgeTxState.SygmaPending:
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
