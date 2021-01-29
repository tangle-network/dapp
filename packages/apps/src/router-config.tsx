import React, { FC, lazy, Suspense } from 'react';

import { PageContentLoading } from '@webb-dapp/ui-components';

import { sideBarConfig } from './sidebar-config';
import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';

const PageBridge = lazy(() => import('@webb-dapp/page-bridge'));

const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<PageContentLoading />}>{children}</Suspense>;
};

export const config: RouterConfigData[] = [
  {
    children: [
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
        path: '*',
        redirectTo: 'bridge',
      },
    ],
    element: <Layout.Main sidebar={sideBarConfig} />,
    path: '*',
  },
];
