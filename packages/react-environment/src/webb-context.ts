import React from 'react';
import { WalletConfig } from '@webb-dapp/react-environment/types/wallet-config.interface';
import { ChainConfig } from '@webb-dapp/react-environment/types/chian-config.interface';

type AppConfig = {
  wallet: Record<number, WalletConfig>;
  chains: Record<number, ChainConfig>;
}

export interface WebbContentState {
  appConfig: AppConfig;


};


export const WebbContext = React.createContext<WebbContentState>({
  appConfig: {
    wallet: {},
    chains: {}
  }
});