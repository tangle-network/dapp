import { RouterConfigData } from '@webb-tools/api-provider-environment';
import { BareProps } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons';
import { FC, lazy, Suspense } from 'react';
import { Layout } from '../containers';

const Bridge = lazy(() => import('../pages/Hubble/Bridge'));
const WrapAndUnwrap = lazy(() => import('../pages/Hubble/WrapAndUnwrap'));
const Account = lazy(() => import('../pages/Account'));
const Ecosystem = lazy(() => import('../pages/Ecosystem'));

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
            <Bridge />
          </CSuspense>
        ),
        path: 'bridge',
        title: 'Bridge',
      },
      {
        element: (
          <CSuspense>
            <WrapAndUnwrap />
          </CSuspense>
        ),
        path: 'wrap-unwrap',
        title: 'Wrap/Unwrap',
      },
      {
        element: (
          <CSuspense>
            <Account />
          </CSuspense>
        ),
        path: 'account',
        title: 'Account',
      },
      {
        element: (
          <CSuspense>
            <Ecosystem />
          </CSuspense>
        ),
        path: 'ecosystem',
        title: 'Ecosystem',
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
