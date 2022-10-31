import { RouterConfigData } from '@webb-dapp/react-environment';
import { Spinner } from '@webb-dapp/webb-ui-components/icons';
import { FC, lazy, Suspense } from 'react';

import { Layout } from '../containers';

const PageAuthorities = lazy(() => import('@webb-dapp/page-statistics/pages/Authorities'));
const PageAuthorityDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/AuthorityDetailDrawer'));
const PageAuthorityDetail = lazy(() => import('@webb-dapp/page-statistics/pages/AuthorityDetailPage'));

const PageAuthoritiesHistory = lazy(() => import('@webb-dapp/page-statistics/pages/AuthoritiesHistory'));

const PageKeys = lazy(() => import('@webb-dapp/page-statistics/pages/Keys'));
const PageKeyDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailDrawer'));
const PageKeyDetail = lazy(() => import('@webb-dapp/page-statistics/pages/KeyDetailPage'));

const PageProposals = lazy(() => import('@webb-dapp/page-statistics/pages/Proposals'));
const PageProposalDetailDrawer = lazy(() => import('@webb-dapp/page-statistics/pages/ProposalDetailDrawer'));
const PageProposalDetail = lazy(() => import('@webb-dapp/page-statistics/pages/ProposalDetailPage'));

const PageComponentsShowcase = lazy(() => import('@webb-dapp/page-statistics/pages/ComponentsShowcase'));

const PageBridgeControlShowcase = lazy(() => import('@webb-dapp/page-statistics/pages/BridgeControlShowcase'));
const TransactionProgressCardShowCase = lazy(
  () => import('@webb-dapp/page-statistics/pages/TransactionProgressCardShowCase')
);

const CSuspense: FC = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className='flex items-center justify-center min-w-full min-h-screen'>
          <Spinner size='xl' />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export const routes: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageBridgeControlShowcase />
          </CSuspense>
        ),
        path: 'bridge-control-showcase/*',
      },
      {
        element: (
          <CSuspense>
            <PageComponentsShowcase />
          </CSuspense>
        ),
        path: 'components-showcase/*',
      },
      {
        element: (
          <CSuspense>
            <TransactionProgressCardShowCase />
          </CSuspense>
        ),
        path: 'tx-card-showcase/*',
      },
      {
        element: (
          <CSuspense>
            <PageAuthoritiesHistory />
          </CSuspense>
        ),
        path: 'authorities/history',
      },
      {
        element: (
          <CSuspense>
            <PageAuthorityDetail />
          </CSuspense>
        ),
        path: 'authorities/:authorityId',
      },
      {
        element: (
          <CSuspense>
            <PageAuthorities />
          </CSuspense>
        ),
        children: [
          {
            path: 'drawer/:authorityId',
            element: (
              <CSuspense>
                <PageAuthorityDetailDrawer />
              </CSuspense>
            ),
          },
        ],
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
