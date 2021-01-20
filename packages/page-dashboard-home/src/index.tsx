import { Page } from '@webb-dapp/ui-components';
import React, { FC } from 'react';

import DashboardDetail from './components/DashboardDetail';

const PageDashboardHome: FC = () => {
  return (
    <Page fullscreen>
      <Page.Title title='Home' />
      <Page.Content>
        <DashboardDetail />
      </Page.Content>
    </Page>
  );
};

export default PageDashboardHome;
