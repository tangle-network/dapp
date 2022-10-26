import { RouterConfigData } from '@nepoche/react-environment';
import { Spinner } from '@nepoche/webb-ui-components';
import { BareProps } from '@nepoche/dapp-types';
import { FC, lazy, Suspense } from 'react';

import { Layout } from '../containers';

const PageAuthorities = lazy(() => import('../pages/Authorities'));
const PageAuthorityDetailDrawer = lazy(() => import('../pages/AuthorityDetailDrawer'));
const PageAuthorityDetail = lazy(() => import('../pages/AuthorityDetailPage'));

const PageAuthoritiesHistory = lazy(() => import('../pages/AuthoritiesHistory'));

const PageKeys = lazy(() => import('../pages/Keys'));
const PageKeyDetailDrawer = lazy(() => import('../pages/KeyDetailDrawer'));
const PageKeyDetail = lazy(() => import('../pages/KeyDetailPage'));

const PageProposals = lazy(() => import('../pages/Proposals'));
const PageProposalDetailDrawer = lazy(() => import('../pages/ProposalDetailDrawer'));
const PageProposalDetail = lazy(() => import('../pages/ProposalDetailPage'));

const PageComponentsShowcase = lazy(() => import('../pages/ComponentsShowcase'));

const CSuspense: FC<BareProps> = ({ children }) => {
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
            <PageComponentsShowcase />
          </CSuspense>
        ),
        path: 'components-showcase/*',
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
