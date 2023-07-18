import { RouterConfigData } from '@webb-tools/api-provider-environment';
import { Spinner } from '@webb-tools/icons';
import { FC, PropsWithChildren, Suspense, lazy } from 'react';
import { Layout } from '../containers';

const PageAuthorities = lazy(() => import('../pages/Authorities'));
const PageAuthorityDetailDrawer = lazy(
  () => import('../pages/AuthorityDetailDrawer')
);
const PageAuthorityDetail = lazy(() => import('../pages/AuthorityDetailPage'));

const PageAuthoritiesHistory = lazy(
  () => import('../pages/AuthoritiesHistory')
);

const PageKeys = lazy(() => import('../pages/Keys'));
const PageKeyDetailDrawer = lazy(() => import('../pages/KeyDetailDrawer'));
const PageKeyDetail = lazy(() => import('../pages/KeyDetailPage'));

const PageProposals = lazy(() => import('../pages/Proposals'));
const PageProposalDetailDrawer = lazy(
  () => import('../pages/ProposalDetailDrawer')
);
const PageProposalDetail = lazy(() => import('../pages/ProposalDetailPage'));

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
