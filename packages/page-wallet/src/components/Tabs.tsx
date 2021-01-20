import React, { FC, useContext } from 'react';

import { useTranslation } from '@webb-dapp/react-hooks';
import { Tabs as UITabs } from '@webb-dapp/ui-components';

import { WalletContext, WalletTabType } from './WalletProvider';
import { AcalaConsole } from './AcalaConsole';
import { CrossChainConsole } from './cross-chain';
import { NFT } from './NFT';

export const Tabs: FC = () => {
  const { t } = useTranslation('page-wallet');
  const { activeTab, changeActiveTab } = useContext(WalletContext);

  return (
    <UITabs<WalletTabType> active={activeTab} onChange={changeActiveTab}>
      <UITabs.Panel $key='acala' header='Acala'>
        <AcalaConsole />
      </UITabs.Panel>
      <UITabs.Panel $key='collectibles' header={t('Collectibles')}>
        <NFT />
      </UITabs.Panel>
      <UITabs.Panel $key='cross-chain' header={t('Cross-Chain')}>
        <CrossChainConsole />
      </UITabs.Panel>
    </UITabs>
  );
};
