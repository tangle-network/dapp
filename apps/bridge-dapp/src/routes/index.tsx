import { Button, Typography } from '@webb-tools/webb-ui-components';
import { Layout } from '../containers';
import { RouterConfigData } from '@webb-tools/react-environment';
import { Spinner } from '@webb-tools/icons';
import { BareProps } from '@webb-tools/dapp-types';
import React, { FC, Suspense } from 'react';

// TODO: Implement these pages for the Bridge Dapp
// const PageVBridge = lazy(() => import('@webb-dapp/vbridge'));
// const PageWrapUnwrap = lazy(() => import('@webb-dapp/page-wrap-unwrap'));
// const PageNoteAccount = lazy(() => import('@webb-dapp/page-note-account'));

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

export const config: RouterConfigData[] = [
  {
    children: [
      {
        element: (
          <CSuspense>
            <Typography variant='h1'>Bridges</Typography>
            <Button>Some button</Button>
          </CSuspense>
        ),
        path: 'bridge/*',
        title: 'Bridges',
      },
      {
        element: (
          <CSuspense>
            <Typography variant='h1'>Wrap Unwrap</Typography>
          </CSuspense>
        ),
        path: 'wrap-unwrap/*',
        title: 'Wrap/Unwrap',
      },
      {
        element: (
          <CSuspense>
            <Typography variant='h1'>Note Account</Typography>
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
