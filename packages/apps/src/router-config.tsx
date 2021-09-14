import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';
import { PageContentLoading } from '@webb-dapp/ui-components';
import React, { FC, lazy, Suspense } from 'react';

import { sideBarConfig } from './sidebar-config';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));
// const PageBridge = lazy(() => import('@webb-dapp/page-bridge'));
const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<PageContentLoading />}>{children}</Suspense>;
};

export const config: RouterConfigData[] = [
  {
    children: [
      {
        element: <CSuspense>{/*<PageWallet />*/}</CSuspense>,
        path: 'wallet',
        title: 'Wallet',
      },
      {
        element: (
          <CSuspense>
            <PageMixer />
          </CSuspense>
        ),
        path: 'mixer',
        title: 'Mixer',
      },
      // {
      //   element: (
      //     <CSuspense>
      //       <PageBridge />
      //     </CSuspense>
      //   ),
      //   path: 'bridge',
      //   title: 'Bridge',
      // },
      {
        element: <CSuspense>{/*  <PageGovernance />*/}</CSuspense>,
        path: 'governance/*',
        title: 'Governance Overview',
      },
      {
        path: '*',
        redirectTo: 'mixer',
      },
    ],
    element: <Layout.Main sidebar={sideBarConfig} />,
    path: '*',
  },
];
