'use client';

import { createContext, FC, PropsWithChildren } from 'react';

import { BridgeTxState } from '../types/bridge';

type BridgeTxItem = {
  id: string;
  sourceTypedChainId: number;
  destinationTypedChainId: number;
  sourceAddress: string;
  recipientAddress: string;
  sourceAmount: string;
  destinationAmount: string;
  tokenSymbol: string;
  createdAt: Date;
  state: BridgeTxState;
  explorerUrl?: string;
};

interface BridgeTxQueueContextProps {
  txQueue: BridgeTxItem[];
}

const BridgeTxQueueContext = createContext<BridgeTxQueueContextProps>({
  txQueue: [],
});

const BridgeTxQueueProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BridgeTxQueueContext.Provider value={{ txQueue: [] }}>
      {children}
    </BridgeTxQueueContext.Provider>
  );
};

export default BridgeTxQueueProvider;
