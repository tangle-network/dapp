import { FC, lazy, Suspense, PropsWithChildren } from 'react';

import { Layout } from '../containers';
import { Spinner } from '@webb-tools/icons';
import { RouterConfigData } from '@webb-tools/react-environment';

const PageAuthorities = lazy(
  () => import('@webb-tools/stats-dapp/pages/Authorities')
);
const PageAuthorityDetailDrawer = lazy(
  () => import('@webb-tools/stats-dapp/pages/AuthorityDetailDrawer')
);
const PageAuthorityDetail = lazy(
  () => import('@webb-tools/stats-dapp/pages/AuthorityDetailPage')
);

const PageAuthoritiesHistory = lazy(
  () => import('@webb-tools/stats-dapp/pages/AuthoritiesHistory')
);

const PageKeys = lazy(() => import('@webb-tools/stats-dapp/pages/Keys'));
const PageKeyDetailDrawer = lazy(
  () => import('@webb-tools/stats-dapp/pages/KeyDetailDrawer')
);
const PageKeyDetail = lazy(
  () => import('@webb-tools/stats-dapp/pages/KeyDetailPage')
);

const PageProposals = lazy(
  () => import('@webb-tools/stats-dapp/pages/Proposals')
);
const PageProposalDetailDrawer = lazy(
  () => import('@webb-tools/stats-dapp/pages/ProposalDetailDrawer')
);
const PageProposalDetail = lazy(
  () => import('@webb-tools/stats-dapp/pages/ProposalDetailPage')
);

const CSuspense: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-w-full min-h-screen">
          <Spinner size="xl" />
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
        redirectTo: 'keys',
      },
    ],
    element: <Layout />,
    path: '*',
  },
];
