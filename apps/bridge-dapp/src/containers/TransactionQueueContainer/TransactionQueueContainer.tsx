import { useTxQueue } from '@webb-tools/react-hooks';
import { TransactionQueueCard } from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';

const TransactionQueueContainer = () => {
  const { txPayloads } = useTxQueue();

  const isDisplayTxQueueCard = useMemo(
    () => txPayloads.length > 0,
    [txPayloads]
  );

  if (!isDisplayTxQueueCard) {
    return null;
  }

  return (
    <TransactionQueueCard
      className="w-full mb-4 max-w-none"
      transactions={txPayloads}
    />
  );
};

export default TransactionQueueContainer;
