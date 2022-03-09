import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';
import { PageContentLoading } from '@webb-dapp/ui-components';
import { isProduction } from '@webb-dapp/utils/misc';
import React, { FC, lazy, Suspense } from 'react';

import { sideBarConfig } from './sidebar-config';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));
const PageBridge = lazy(() => import('@webb-dapp/page-bridge'));
const PageWrapUnwrap = lazy(() => import('@webb-dapp/page-wrap-unwrap'));
const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<PageContentLoading />}>{children}</Suspense>;
};

export const config: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageMixer />
          </CSuspense>
        ),
        path: 'tornado',
        title: 'Tornados',
      },
      {
        element: (
          <CSuspense>
            <PageBridge />
          </CSuspense>
        ),
        path: 'bridge',
        title: 'Bridges',
      },
      {
        element: (
          <CSuspense>
            <PageWrapUnwrap />
          </CSuspense>
        ),
        path: 'wrap-unwrap/*',
        title: 'Wrap/Unwrap',
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
