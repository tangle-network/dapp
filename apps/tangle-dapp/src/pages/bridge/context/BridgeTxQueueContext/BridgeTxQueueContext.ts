import {
  BridgeQueueTxItem,
  BridgeTxState,
} from '@webb-tools/tangle-shared-ui/types';
import { createContext } from 'react';

interface BridgeTxQueueContextProps {
  txQueue: BridgeQueueTxItem[];
  addTxToQueue: (tx: Omit<BridgeQueueTxItem, 'state'>) => void;
  deleteTxFromQueue: (txHash: string) => void;
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

export default BridgeTxQueueContext;
