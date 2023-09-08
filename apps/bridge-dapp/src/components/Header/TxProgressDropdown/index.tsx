import {
  DropdownMenuPortal as DropdownPortal,
  DropdownMenuTrigger as DropdownTrigger,
} from '@radix-ui/react-dropdown-menu';
import type { Transaction } from '@webb-tools/abstract-api-provider/transaction';
import { transactionItemStatusFromTxStatus } from '@webb-tools/api-provider-environment/transaction';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import {
  Dropdown,
  DropdownBody,
} from '@webb-tools/webb-ui-components/components/Dropdown';
import LoadingPill from '@webb-tools/webb-ui-components/components/buttons/LoadingPill';
import type { LoadingPillStatus } from '@webb-tools/webb-ui-components/components/buttons/types';
import type { TransactionItemStatus } from '@webb-tools/webb-ui-components/containers/TransactionProgressCard';
import { useEffect, useMemo, useState } from 'react';
import TxItem from './TxItem';

const TxProgressDropdown = () => {
  const { txQueue: txQueue_ } = useWebContext();

  const { txQueue, currentTxId } = txQueue_;

  const [pillStatus, setPillStatus] = useState<LoadingPillStatus>('loading');

  // Sort the latest tx to the top
  const sortedTxQueue = useSortedTxQueue(txQueue);

  const currentTx = useCurrentTx(sortedTxQueue, currentTxId);

  useEffect(() => {
    if (!currentTx) {
      return;
    }

    const sub = currentTx.$currentStatus.subscribe(([state]) => {
      const status = transactionItemStatusFromTxStatus(state);
      const nextPillStatus = getPillStatus(status);
      setPillStatus(nextPillStatus);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [currentTx]);

  if (!txQueue.length) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger asChild>
        <LoadingPill status={pillStatus} />
      </DropdownTrigger>

      <DropdownPortal>
        <DropdownBody className="mt-4 max-h-80 w-[32rem] overflow-scroll overflow-x-hidden">
          {sortedTxQueue.map((tx) => {
            return <TxItem key={tx.id} tx={tx} />;
          })}
        </DropdownBody>
      </DropdownPortal>
    </Dropdown>
  );
};

export default TxProgressDropdown;

const useSortedTxQueue = (txQueue: Array<Transaction<unknown>>) => {
  return useMemo(
    () =>
      txQueue
        .slice()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [txQueue]
  );
};

const useCurrentTx = (
  txQueue: Array<Transaction<unknown>>,
  txId: string | null
) => {
  return useMemo(() => {
    if (typeof txId === 'string') {
      return txQueue.find((tx) => tx.id === txId);
    }

    // Get the latest tx
    return txQueue[0];
  }, [txId, txQueue]);
};

const getPillStatus = (txStatus: TransactionItemStatus): LoadingPillStatus =>
  txStatus === 'completed'
    ? 'success'
    : txStatus === 'warning'
    ? 'error'
    : 'loading';
