import { BareProps } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons';
import { FC, lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { Layout } from '../containers';
import Deposit from '../pages/Hubble/Bridge/Deposit';
import Transfer from '../pages/Hubble/Bridge/Transfer';
import Withdraw from '../pages/Hubble/Bridge/Withdraw';

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

const BridgeRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        <Route
          path="*"
          element={
            <CSuspense>
              <Layout />
            </CSuspense>
          }
        >
          <Route
            path="bridge"
            element={
              <CSuspense>
                <Bridge />
              </CSuspense>
            }
          >
            <Route
              path="deposit"
              element={
                <CSuspense>
                  <Deposit />
                </CSuspense>
              }
            />
            <Route
              path="transfer"
              element={
                <CSuspense>
                  <Transfer />
                </CSuspense>
              }
            />
            <Route
              path="withdraw"
              element={
                <CSuspense>
                  <Withdraw />
                </CSuspense>
              }
            />
            <Route path="*" element={<Navigate to="deposit" />} />
          </Route>
          <Route
            path="wrap-unwrap"
            element={
              <CSuspense>
                <WrapAndUnwrap />
              </CSuspense>
            }
          />
          <Route
            path="account"
            element={
              <CSuspense>
                <Account />
              </CSuspense>
            }
          />
          <Route
            path="ecosystem"
            element={
              <CSuspense>
                <Ecosystem />
              </CSuspense>
            }
          />
          <Route path="*" element={<Navigate to="bridge" />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default BridgeRoutes;
