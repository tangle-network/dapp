'use client';

import React, { createContext, useContext, useState } from 'react';

interface TxConfirmationState {
  isOpen: boolean;
  status: 'success' | 'error';
  hash: string;
  txType: 'substrate' | 'evm';
}

interface TxConfirmationContextType {
  txConfirmationState: TxConfirmationState;
  setTxConfirmationState: (state: TxConfirmationState) => void;
}

const initialState: TxConfirmationState = {
  isOpen: false,
  status: 'error',
  hash: '',
  txType: 'evm',
};

const TxConfirmationContext = createContext<
  TxConfirmationContextType | undefined
>(undefined);

export const TxConfirmationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [txConfirmationState, setTxConfirmationState] =
    useState<TxConfirmationState>(initialState);

  const value = {
    txConfirmationState,
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
