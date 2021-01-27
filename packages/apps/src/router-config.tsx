import React, { FC, lazy, Suspense } from 'react';

import { PageContentLoading } from '@webb-dapp/ui-components';

import { sideBarConfig } from './sidebar-config';
import { Layout } from '@webb-dapp/react-components';
import { RouterConfigData } from '@webb-dapp/react-environment';

const PageMixer = lazy(() => import('@webb-dapp/page-mixer'));

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
        path: 'mixer',
        title: 'Mixer',
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
