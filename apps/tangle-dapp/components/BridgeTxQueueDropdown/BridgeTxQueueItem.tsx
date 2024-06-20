import { StatusVariant } from '@webb-tools/icons/StatusIndicator/types';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { TxProgressor } from '@webb-tools/webb-ui-components/components/TxProgressor';
import { FC } from 'react';

import { BridgeQueueTxItem, BridgeTxState } from '../../types/bridge';

interface BridgeTxQueueItemProps {
  tx: BridgeQueueTxItem;
  className?: string;
}

const BridgeTxQueueItem: FC<BridgeTxQueueItemProps> = ({ tx, className }) => {
  return (
    <TxProgressor.Root key={tx.id} className={className}>
      <TxProgressor.Header name="Bridge" createdAt={tx.createdAt} />
      <TxProgressor.Body
        txSourceInfo={{
          isSource: true,
          typedChainId: tx.sourceTypedChainId,
          amount: -tx.sourceAmount, // might need to convert
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.sourceAddress,
        }}
        txDestinationInfo={{
          typedChainId: tx.destinationTypedChainId,
          amount: +tx.destinationAmount, // might need to convert
          tokenSymbol: tx.tokenSymbol,
          walletAddress: tx.recipientAddress,
        }}
      />
      <TxProgressor.Footer
        status={getStatus(tx.state)}
        statusMessage={tx.state}
        steppedProgressProps={{
          steps: 4,
          activeStep: getActiveStep(tx.state),
        }}
        actionProps={
          tx.explorerUrl
            ? {
                children: (
                  <Button variant="link" href={tx.explorerUrl} size="sm">
                    Open explorer
                  </Button>
                ),
              }
            : undefined
        }
      />
    </TxProgressor.Root>
  );
};

export default BridgeTxQueueItem;

const getActiveStep = (state: BridgeTxState) => {
  switch (state) {
    case BridgeTxState.SigningTx:
      return 1;
    case BridgeTxState.SendingTx:
      return 2;
    case BridgeTxState.Indexing:
      return 3;
    case BridgeTxState.Executed:
      return 4;
    case BridgeTxState.Failed:
      return 4;
    default:
      throw new Error(`Invalid state: ${state}`);
  }
};

const getStatus = (state: BridgeTxState): StatusVariant => {
  switch (state) {
    case BridgeTxState.SigningTx:
    case BridgeTxState.SendingTx:
    case BridgeTxState.Indexing:
      return 'info';
    case BridgeTxState.Executed:
      return 'success';
    case BridgeTxState.Failed:
      return 'error';
    default:
      throw new Error(`Invalid state: ${state}`);
  }
};
