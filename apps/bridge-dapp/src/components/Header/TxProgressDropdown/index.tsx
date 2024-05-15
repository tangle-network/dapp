import { DropdownMenuTrigger as DropdownTrigger } from '@radix-ui/react-dropdown-menu';
import type { TransactionExecutor } from '@webb-tools/abstract-api-provider/transaction';
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
import { useLocation } from 'react-router';
import { NOTE_ACCOUNT_PATH } from '../../../constants/paths';
import useCurrentTx from '../../../hooks/useCurrentTx';
import TxItem from './TxItem';

const TxProgressDropdown = () => {
  const { txQueue: txQueue_ } = useWebContext();
  const { pathname } = useLocation();

  const { txQueue, currentTxId } = txQueue_;

  const [pillStatus, setPillStatus] = useState<LoadingPillStatus>('loading');

  // Sort the latest tx to the top
  const sortedTxQueue = useSortedTxQueue(txQueue);

  const currentTx = useCurrentTx(sortedTxQueue, currentTxId, { latest: true });

  const isOnAccountPage = useMemo(
    () => pathname.includes(`/${NOTE_ACCOUNT_PATH}`),
    [pathname]
  );

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
    <Dropdown radixRootProps={{ defaultOpen: true }}>
      <DropdownTrigger asChild>
        <LoadingPill status={pillStatus} />
      </DropdownTrigger>

      <DropdownBody
        align="start"
        className="mt-4 -ml-14 max-h-80 w-[30rem] overflow-scroll overflow-x-hidden"
      >
        {sortedTxQueue.map((tx) => {
          return (
            <TxItem key={tx.id} tx={tx} isOnAccountPage={isOnAccountPage} />
          );
        })}
      </DropdownBody>
    </Dropdown>
  );
};

export default TxProgressDropdown;

const useSortedTxQueue = (txQueue: Array<TransactionExecutor<unknown>>) => {
  return useMemo(
    () =>
      txQueue
        .slice()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [txQueue]
  );
};

const getPillStatus = (txStatus: TransactionItemStatus): LoadingPillStatus =>
  txStatus === 'completed'
    ? 'success'
    : txStatus === 'warning'
    ? 'error'
    : 'loading';
