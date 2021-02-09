import React, { FC } from 'react';

import { Tabs } from './components/Tabs';
import { WalletProvider } from './components/WalletProvider';

const PageWallet: FC = () => {
  return (
    <WalletProvider>
      <Tabs />
    </WalletProvider>
  );
};

export default PageWallet;
