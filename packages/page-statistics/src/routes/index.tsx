import { RouterConfigData } from '@webb-dapp/react-environment';
import React, { FC, lazy, Suspense } from 'react';

import { Layout } from '../containers';

const PageAuthorities = lazy(() => import('@webb-dapp/page-statistics/pages/Authorities'));
const PageKeys = lazy(() => import('@webb-dapp/page-statistics/pages/Keys'));
const PageProposals = lazy(() => import('@webb-dapp/page-statistics/pages/Proposals'));

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
            <PageKeys />
          </CSuspense>
        ),
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
