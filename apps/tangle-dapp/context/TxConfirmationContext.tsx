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
  setTxConfirmationState: (state: TxConfirmationState) => void;
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

export const TxConfirmationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [txnConfirmationState, setTxConfirmationState] =
    useState<TxConfirmationState>(initialState);

  const value = {
    txnConfirmationState,
    setTxConfirmationState,
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
      'useTxnConfirmationModal must be used within a TxConfirmationProvider'
    );
  }
  return context;
};
