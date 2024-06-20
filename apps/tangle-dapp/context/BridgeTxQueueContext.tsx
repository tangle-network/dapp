'use client';

import { createContext, FC, PropsWithChildren, useContext } from 'react';

import { BridgeQueueTxItem, BridgeTxState } from '../types/bridge';

interface BridgeTxQueueContextProps {
  txQueue: BridgeQueueTxItem[];
}

const dummyData: BridgeQueueTxItem[] = [
  {
    id: '4',
    sourceTypedChainId: 1099511627781,
    destinationTypedChainId: 1099511629063,
    sourceAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    recipientAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    sourceAmount: '100',
    destinationAmount: '98',
    tokenSymbol: 'ETH',
    createdAt: new Date(),
    state: BridgeTxState.Indexing,
    explorerUrl: 'https://etherscan.io/tx/0x123456789abcdef0',
  },
  {
    id: '3',
    sourceTypedChainId: 1099511670889,
    destinationTypedChainId: 1099511707777,
    sourceAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    recipientAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    sourceAmount: '100',
    destinationAmount: '98',
    tokenSymbol: 'ETH',
    createdAt: new Date(),
    state: BridgeTxState.Executed,
    explorerUrl: 'https://etherscan.io/tx/0x123456789abcdef0',
  },
  {
    id: '2',
    sourceTypedChainId: 1099511670889,
    destinationTypedChainId: 1099511707777,
    sourceAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    recipientAddress: '0xb607A500574fE29afb0d0681f1dC3E82f79f4877',
    sourceAmount: '100',
    destinationAmount: '98',
    tokenSymbol: 'ETH',
    createdAt: new Date(),
    state: BridgeTxState.Failed,
    explorerUrl: 'https://etherscan.io/tx/0x123456789abcdef0',
  },
];

const BridgeTxQueueContext = createContext<BridgeTxQueueContextProps>({
  txQueue: [],
});

export const useBridgeTxQueue = () => {
  return useContext(BridgeTxQueueContext);
};

const BridgeTxQueueProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <BridgeTxQueueContext.Provider value={{ txQueue: dummyData }}>
      {children}
    </BridgeTxQueueContext.Provider>
  );
};

export default BridgeTxQueueProvider;
