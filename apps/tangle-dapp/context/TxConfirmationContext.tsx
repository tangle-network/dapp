'use client';

import React, { createContext, useContext, useState } from 'react';

interface TxConfirmationState {
  isOpen: boolean;
  status: 'success' | 'error';
  hash: string;
  txnType: 'substrate' | 'evm';
}

interface TxConfirmationContextType {
  txnConfirmationState: TxConfirmationState;
  setTxnConfirmationState: (state: TxConfirmationState) => void;
}

const initialState: TxConfirmationState = {
  isOpen: false,
  status: 'error',
  hash: '',
  txnType: 'evm',
};

const TxConfirmationContext = createContext<
  TxConfirmationContextType | undefined
>(undefined);

export const TxnConfirmationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [txnConfirmationState, setTxnConfirmationState] =
    useState<TxConfirmationState>(initialState);

  const value = {
    txnConfirmationState,
    setTxnConfirmationState,
  };

  return (
    <TxConfirmationContext.Provider value={value}>
      {children}
    </TxConfirmationContext.Provider>
  );
};

export const useTxConfirmationModal = () => {
  const context = useContext(TxConfirmationContext);
  if (context === undefined) {
    throw new Error(
      'useTxnConfirmationModal must be used within a TxnConfirmationProvider'
    );
  }
  return context;
};
