import { BareProps } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons';
import { RouterConfigData } from '@webb-tools/react-environment';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC, lazy, Suspense } from 'react';
import { Layout } from '../containers';

// TODO: Implement these pages for the Bridge Dapp
const PageBridge = lazy(() => import('../pages/PageBridge'));
// const PageWrapUnwrap = lazy(() => import('@webb-tools/page-wrap-unwrap'));
const PageNoteAccount = lazy(() => import('../pages/PageNoteAccount'));

const CSuspense: FC<BareProps> = ({ children }) => {
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

export const config: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <PageBridge />
          </CSuspense>
        ),
        path: 'bridge/*',
        title: 'Bridges',
      },
      {
        element: (
          <CSuspense>
            <Typography variant="h1">Wrap Unwrap</Typography>
          </CSuspense>
        ),
        path: 'wrap-unwrap/*',
        title: 'Wrap/Unwrap',
      },
      {
        element: (
          <CSuspense>
            <PageNoteAccount />
          </CSuspense>
        ),
        path: 'note-account/*',
        title: 'Note Account',
      },
      {
        path: '*',
        redirectTo: 'bridge',
      },
    ],
    element: <Layout />,
    path: '*',
  },
].filter((elt) => elt.path !== 'null');
