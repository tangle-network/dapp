'use client';

import React, { createContext, useContext, useState } from 'react';

interface TxnConfirmationState {
  isOpen: boolean;
  status: 'success' | 'error';
  hash: string;
  txnType: 'substrate' | 'evm';
}

interface TxnConfirmationContextType {
  txnConfirmationState: TxnConfirmationState;
  setTxnConfirmationState: (state: TxnConfirmationState) => void;
}

const initialState: TxnConfirmationState = {
  isOpen: false,
  status: 'error',
  hash: '',
  txnType: 'evm',
};

const TxnConfirmationContext = createContext<
  TxnConfirmationContextType | undefined
>(undefined);

export const TxnConfirmationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [txnConfirmationState, setTxnConfirmationState] =
    useState<TxnConfirmationState>(initialState);

  const value = {
    txnConfirmationState,
    setTxnConfirmationState,
  };

  return (
    <TxnConfirmationContext.Provider value={value}>
      {children}
    </TxnConfirmationContext.Provider>
  );
};

export const useTxnConfirmation = () => {
  const context = useContext(TxnConfirmationContext);
  if (context === undefined) {
    throw new Error(
      'useTxnConfirmation must be used within a TxnConfirmationProvider'
    );
  }
  return context;
};
