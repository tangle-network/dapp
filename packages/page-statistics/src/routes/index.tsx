import { RouterConfigData } from '@webb-dapp/react-environment';
import { FC, lazy, Suspense } from 'react';

import { Layout } from '../containers';

const PageAuthorities = lazy(() => import('@webb-dapp/page-statistics/pages/Authorities'));

const PageKeys = lazy(() => import('@webb-dapp/page-statistics/pages/Keys'));
const PageKeyDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailDrawer'));
const PageKeyDetail = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailPage'));

const PageProposals = lazy(() => import('@webb-dapp/page-statistics/pages/Proposals'));
const PageProposalDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/ProposalDetailDrawer'));
const PageProposalDetail = lazy(() => import('@webb-dapp/page-statistics/pages/ProposalDetailPage'));

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
            <PageProposalDetail />
          </CSuspense>
        ),
        path: 'proposals/:proposalId',
      },
      {
        element: (
          <CSuspense>
            <PageProposals />
          </CSuspense>
        ),
        children: [
          {
            path: 'drawer/:proposalId',
            element: (
              <CSuspense>
                <PageProposalDetailDrawer />
              </CSuspense>
            ),
          },
        ],
        path: 'proposals/*',
      },
      {
        path: '*',
        redirectTo: 'proposals',
      },
    ],
    element: <Layout />,
    path: '*',
  },
];
