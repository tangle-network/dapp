import { RouterConfigData } from '@webb-dapp/react-environment';
import React, { FC, lazy, Suspense } from 'react';

import { Layout } from '../containers';

const PageKeys = lazy(() => import('@webb-dapp/page-statistics/pages/Keys'));

const CSuspense: FC = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export const routes: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageKeys />
          </CSuspense>
        ),
        path: 'keys/*',
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
