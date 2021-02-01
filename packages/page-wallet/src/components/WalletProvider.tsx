import React, { createContext, FC, useState, Dispatch, SetStateAction } from 'react';
import { BareProps } from '@webb-dapp/ui-components/types';

export type WalletTabType = 'webb';

export interface WalletContextData {
  activeTab: WalletTabType;
  changeActiveTab: Dispatch<SetStateAction<WalletTabType>>;
}

export const WalletContext = createContext<WalletContextData>({} as WalletContextData);

export const WalletProvider: FC<BareProps> = ({ children }) => {
  const [activeTab, changeActiveTab] = useState<WalletTabType>('webb');

  return (
    <WalletContext.Provider
      value={{
        activeTab,
        changeActiveTab,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
