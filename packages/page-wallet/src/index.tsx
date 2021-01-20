import React, { FC } from 'react';

import { WalletProvider } from './components/WalletProvider';
import { Tabs } from './components/Tabs';

const PageWallet: FC = () => {
  return (
    <WalletProvider>
      <Tabs />
    </WalletProvider>
  );
};

export default PageWallet;
