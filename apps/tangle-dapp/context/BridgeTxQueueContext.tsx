'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';

import useActiveAccountAddress from '../hooks/useActiveAccountAddress';
import useLocalStorage, {
  LocalStorageKey,
  TxQueueByAccount,
} from '../hooks/useLocalStorage';
import { BridgeQueueTxItem, BridgeTxState } from '../types/bridge';
import Optional from '../utils/Optional';

interface BridgeTxQueueContextProps {
  txQueue: BridgeQueueTxItem[];
  addTxToQueue: (tx: BridgeQueueTxItem) => void;
  deleteTxFromQueue: (txHash: string) => void;
  addSygmaTxId: (txHash: string, sygmaTxId: string) => void;
  addTxExplorerUrl: (txHash: string, explorerUrl: string) => void;
  updateTxState: (txHash: string, state: BridgeTxState) => void;
}

const BridgeTxQueueContext = createContext<BridgeTxQueueContextProps>({
  txQueue: [],
  addTxToQueue: () => {
    return;
  },
  deleteTxFromQueue: () => {
    return;
  },
  updateTxState: () => {
    return;
  },
  addSygmaTxId: () => {
    return;
  },
  addTxExplorerUrl: () => {
    return;
  },
});

export const useBridgeTxQueue = () => {
  return useContext(BridgeTxQueueContext);
};

const BridgeTxQueueProvider: FC<PropsWithChildren> = ({ children }) => {
  const activeAccountAddress = useActiveAccountAddress();
  const {
    setWithPreviousValue: setCachedBridgeTxQueueByAcc,
    valueOpt: cachedBridgeTxQueueByAcc,
  } = useLocalStorage(LocalStorageKey.BRIDGE_TX_QUEUE_BY_ACC);

  const txQueue = useMemo(
    () =>
      activeAccountAddress === null
        ? []
        : getTxQueueFromLocalStorage(
            activeAccountAddress,
            cachedBridgeTxQueueByAcc,
          ),
    [activeAccountAddress, cachedBridgeTxQueueByAcc],
  );

  const addTxToQueue = useCallback(
    (tx: BridgeQueueTxItem) => {
      if (!activeAccountAddress) return;

      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
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
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  const deleteTxFromQueue = useCallback(
    (txHash: string) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
          cache,
        );
        const updatedTxQueue = currTxQueue.filter(
          (txItem) => txItem.hash !== txHash,
        );
        return {
          ...(cache?.value ?? {}),
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  const addSygmaTxId = useCallback(
    (txHash: string, sygmaTxId: string) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
          cache,
        );
        const updatedTxQueue = currTxQueue.map((txItem) => {
          if (txItem.hash === txHash) {
            console.log('Found the one to change');
            return { ...txItem, sygmaTxId };
          }
          return txItem;
        });
        return {
          ...(cache?.value ?? {}),
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  const addTxExplorerUrl = useCallback(
    (txHash: string, explorerUrl: string) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
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
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  const updateTxState = useCallback(
    (txHash: string, state: BridgeTxState) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
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
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  return (
    <BridgeTxQueueContext.Provider
      value={{
        txQueue,
        addTxToQueue,
        deleteTxFromQueue,
        addSygmaTxId,
        updateTxState,
        addTxExplorerUrl,
      }}
    >
      {children}
    </BridgeTxQueueContext.Provider>
  );
};

export default BridgeTxQueueProvider;

const getTxQueueFromLocalStorage = (
  activeAccountAddress: string,
  txQueueByAccFromLocalStorage: Optional<TxQueueByAccount> | null,
) => {
  const bridgeTxQueueByAcc = txQueueByAccFromLocalStorage
    ? txQueueByAccFromLocalStorage.value ?? null
    : null;

  const cachedTxQueue = bridgeTxQueueByAcc?.[activeAccountAddress] ?? [];

  if (cachedTxQueue.length === 0) return [];
  return cachedTxQueue;
};
