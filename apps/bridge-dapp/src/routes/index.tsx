import { BareProps } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons';
import { RouterConfigData } from '@webb-tools/react-environment';
import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC, lazy, Suspense } from 'react';
import { Layout } from '../containers';

const PageBridge = lazy(() => import('../pages/PageBridge'));

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
        path: '*',
        redirectTo: 'bridge',
      },
    ],
    element: <Layout />,
    path: '*',
  },
].filter((elt) => elt.path !== 'null');
