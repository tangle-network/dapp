import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import useLocalStorage, {
  LocalStorageKey,
  TxQueueByAccount,
} from '@webb-tools/tangle-shared-ui/hooks/useLocalStorage';
import {
  BridgeQueueTxItem,
  BridgeTxState,
} from '@webb-tools/tangle-shared-ui/types';
import Optional from '@webb-tools/tangle-shared-ui/utils/Optional';
import { FC, PropsWithChildren, useCallback, useMemo, useState } from 'react';
import BridgeTxQueueContext from './BridgeTxQueueContext';

const getTxQueueFromLocalStorage = (
  activeAccountAddress: string,
  txQueueByAccFromLocalStorage: Optional<TxQueueByAccount> | null,
) => {
  const bridgeTxQueueByAcc = txQueueByAccFromLocalStorage
    ? (txQueueByAccFromLocalStorage.value ?? null)
    : null;

  const cachedTxQueue = bridgeTxQueueByAcc?.[activeAccountAddress] ?? [];

  if (cachedTxQueue.length === 0) return [];
  return cachedTxQueue;
};

const BridgeTxQueueProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeAccount] = useActiveAccount();
  const {
    setWithPreviousValue: setCachedBridgeTxQueueByAcc,
    valueOpt: cachedBridgeTxQueueByAcc,
  } = useLocalStorage(LocalStorageKey.BRIDGE_TX_QUEUE_BY_ACC);

  const [isOpenQueueDropdown, setIsOpenQueueDropdown] = useState(false);

  const txQueue = useMemo(
    () =>
      activeAccount === null
        ? []
        : getTxQueueFromLocalStorage(
            activeAccount.address,
            cachedBridgeTxQueueByAcc,
          ),
    [activeAccount, cachedBridgeTxQueueByAcc],
  );

  const addTxToQueue = useCallback(
    (txData: Omit<BridgeQueueTxItem, 'state'>) => {
      if (!activeAccount) return;
      const tx = {
        ...txData,
        state: BridgeTxState.Pending,
      };

      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );

        // Check if the transaction already exists in the queue
        const txIndex = currTxQueue.findIndex(
          (txItem) => txItem.hash === tx.hash,
        );

        let updatedTxQueue: BridgeQueueTxItem[];
        if (txIndex !== -1) {
          // Replace existing transaction
          updatedTxQueue = [...currTxQueue];
          updatedTxQueue[txIndex] = tx;
        } else {
          // Add new transaction to the beginning of the queue
          updatedTxQueue = [tx, ...currTxQueue];
        }

        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  const deleteTxFromQueue = useCallback(
    (txHash: string) => {
      if (!activeAccount) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );
        const updatedTxQueue = currTxQueue.filter(
          (txItem) => txItem.hash !== txHash,
        );
        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  const addTxExplorerUrl = useCallback(
    (txHash: string, explorerUrl: string) => {
      if (!activeAccount) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );
        const updatedTxQueue = currTxQueue.map((txItem) => {
          if (txItem.hash === txHash) {
            return { ...txItem, explorerUrl };
          }
          return txItem;
        });
        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  const updateTxState = useCallback(
    (txHash: string, state: BridgeTxState) => {
      if (!activeAccount) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );
        const updatedTxQueue = currTxQueue.map((txItem) => {
          if (txItem.hash === txHash) {
            return { ...txItem, state };
          }
          return txItem;
        });
        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  const updateTxDestinationTxState = useCallback(
    (
      txHash: string,
      destinationTxHash: string,
      destinationTxState: BridgeTxState,
    ) => {
      if (!activeAccount) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );
        const updatedTxQueue = currTxQueue.map((txItem) => {
          if (txItem.hash === txHash) {
            return { ...txItem, destinationTxHash, destinationTxState };
          }
          return txItem;
        });
        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  const addTxDestinationTxExplorerUrl = useCallback(
    (txHash: string, destinationTxExplorerUrl: string) => {
      if (!activeAccount) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccount.address,
          cache,
        );
        const updatedTxQueue = currTxQueue.map((txItem) => {
          if (txItem.hash === txHash) {
            return { ...txItem, destinationTxExplorerUrl };
          }
          return txItem;
        });
        return {
          ...(cache?.value ?? {}),
          [activeAccount.address]: updatedTxQueue,
        };
      });
    },
    [activeAccount, setCachedBridgeTxQueueByAcc],
  );

  return (
    <BridgeTxQueueContext.Provider
      value={{
        txQueue,
        addTxToQueue,
        deleteTxFromQueue,
        updateTxState,
        updateTxDestinationTxState,
        addTxDestinationTxExplorerUrl,
        addTxExplorerUrl,
        isOpenQueueDropdown,
        setIsOpenQueueDropdown,
      }}
    >
      {children}
    </BridgeTxQueueContext.Provider>
  );
};

export default BridgeTxQueueProvider;
