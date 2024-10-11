'use client';

import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
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
  addTxToQueue: (tx: Omit<BridgeQueueTxItem, 'state'>) => void;
  deleteTxFromQueue: (txHash: string) => void;
  addSygmaTxId: (txHash: string, sygmaTxId: string) => void;
  addTxExplorerUrl: (txHash: string, explorerUrl: string) => void;
  updateTxState: (txHash: string, state: BridgeTxState) => void;
  updateTxDestinationTxState: (
    txHash: string,
    destinationTxHash: string,
    destinationTxState: BridgeTxState,
  ) => void;
  addTxDestinationTxExplorerUrl: (
    txHash: string,
    destinationTxExplorerUrl: string,
  ) => void;
  isOpenQueueDropdown: boolean;
  setIsOpenQueueDropdown: (isOpen: boolean) => void;
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
  updateTxDestinationTxState: () => {
    return;
  },
  addSygmaTxId: () => {
    return;
  },
  addTxExplorerUrl: () => {
    return;
  },
  addTxDestinationTxExplorerUrl: () => {
    return;
  },
  isOpenQueueDropdown: false,
  setIsOpenQueueDropdown: () => {
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

  const [isOpenQueueDropdown, setIsOpenQueueDropdown] = useState(false);

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
    (txData: Omit<BridgeQueueTxItem, 'state'>) => {
      if (!activeAccountAddress) return;
      const tx = {
        ...txData,
        state: BridgeTxState.Initializing,
      };

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

  const updateTxDestinationTxState = useCallback(
    (
      txHash: string,
      destinationTxHash: string,
      destinationTxState: BridgeTxState,
    ) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
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
          [activeAccountAddress]: updatedTxQueue,
        };
      });
    },
    [activeAccountAddress, setCachedBridgeTxQueueByAcc],
  );

  const addTxDestinationTxExplorerUrl = useCallback(
    (txHash: string, destinationTxExplorerUrl: string) => {
      if (!activeAccountAddress) return;
      setCachedBridgeTxQueueByAcc((cache) => {
        const currTxQueue = getTxQueueFromLocalStorage(
          activeAccountAddress,
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
