import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';
import { PageContentLoading } from '@webb-dapp/ui-components';
import React, { FC, lazy, Suspense } from 'react';

import { sideBarConfig } from './sidebar-config';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));
const PageBridge = lazy(() => import('@webb-dapp/page-bridge'));
// const PageTransfers = lazy(() => import('@webb-dapp/page-transfer'));
const PageWrapUnwrap = lazy(() => import('@webb-dapp/page-wrap-unwrap'));
const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<PageContentLoading />}>{children}</Suspense>;
};

export const config: RouterConfigData[] =
  process.env.REACT_APP_BUILD_ENV === 'production'
    ? [
      {
        children: [
          {
            element: (
              <CSuspense>
                <PageMixer />
              </CSuspense>
            ),
            path: 'tornado',
            title: 'Tornado',
          },
          {
            element: (
              <CSuspense>
                <PageBridge />
              </CSuspense>
            ),
            path: 'bridge',
            title: 'Bridge',
          },
          {
            element: (
              <CSuspense>
                <PageWrapUnwrap />
              </CSuspense>
            ),
            path: 'wrap-unwrap/*',
            title: 'Wrap/Unwrap assets',
          },
          {
            path: '*',
            redirectTo: 'tornado',
          },
        ],
        element: <Layout.Main sidebar={sideBarConfig} />,
        path: '*',
      },
    ].filter((elt) => elt.path !== 'null')
    : [
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
            path: 'tornado',
            title: 'Tornado',
          },
          {
            element: (
              <CSuspense>
                <PageBridge />
              </CSuspense>
            ),
            path: 'bridge',
            title: 'Bridge',
          },
          // {
          //   element: (
          //     <CSuspense>
          //       <PageTransfers />
          //     </CSuspense>
          //   ),
          //   path: 'transfer/*',
          //   title: 'Transfer',
          // },
          {
            element: (
              <CSuspense>
                <PageWrapUnwrap />
              </CSuspense>
            ),
            path: 'wrap-unwrap/*',
            title: 'Wrap/Unwrap assets',
          },
          {
            element: <CSuspense>{/*  <PageGovernance />*/}</CSuspense>,
            path: 'governance/*',
            title: 'Governance Overview',
          },
          {
            path: '*',
            redirectTo: 'tornado',
          },
        ],
        element: <Layout.Main sidebar={sideBarConfig} />,
        path: '*',
      },
    ].filter((elt) => elt.path !== 'null');
