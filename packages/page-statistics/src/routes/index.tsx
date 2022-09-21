import { RouterConfigData } from '@webb-dapp/react-environment';
import { Drawer, DrawerContent } from '@webb-dapp/webb-ui-components/components';
import React, { FC, lazy, Suspense } from 'react';

import { KeyDetail, Layout } from '../containers';

const PageAuthorities = lazy(() => import('@webb-dapp/page-statistics/pages/Authorities'));
const PageKeys = lazy(() => import('@webb-dapp/page-statistics/pages/Keys'));
const PageKeyDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailDrawer'));
const PageProposals = lazy(() => import('@webb-dapp/page-statistics/pages/Proposals'));
const PageKeyDetail = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailPage'));

const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export const routes: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageAuthorities />
          </CSuspense>
        ),
        path: 'authorities/*',
      },
      {
        element: (
          <CSuspense>
            <PageKeyDetail />
          </CSuspense>
        ),
        path: 'keys/:keyId',
      },
      {
        element: (
          <CSuspense>
            <PageKeys />
          </CSuspense>
        ),
        children: [
          {
            path: 'drawer/:keyId',
            element: (
              <CSuspense>
                <PageKeyDetailDrawer />
              </CSuspense>
            ),
          },
        ],
        path: 'keys/*',
      },
      {
        element: (
          <CSuspense>
            <PageProposals />
          </CSuspense>
        ),
        path: 'proposals/*',
      },
      {
        path: '*',
        redirectTo: 'keys',
      },
    ],
    element: <Layout />,
    path: '*',
  },
];
