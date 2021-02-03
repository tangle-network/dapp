import React, { FC, useContext } from 'react';

import { useTranslation } from '@webb-dapp/react-hooks';
import { Tabs as UITabs } from '@webb-dapp/ui-components';

import { WalletContext, WalletTabType } from './WalletProvider';
import { WebbConsole } from './WebbConsole';

export const Tabs: FC = () => {
  const { t } = useTranslation('page-wallet');
  const { activeTab, changeActiveTab } = useContext(WalletContext);

  return (
    <UITabs<WalletTabType> active={activeTab} onChange={changeActiveTab}>
      <UITabs.Panel $key='webb' header='Webb'>
        <WebbConsole />
      </UITabs.Panel>
    </UITabs>
  );
};
