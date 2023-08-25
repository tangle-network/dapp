import { BareProps } from '@webb-tools/dapp-types';
import { Spinner } from '@webb-tools/icons';
import { FC, lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import {
  BRIDGE_PATH,
  DEPOSIT_PATH,
  ECOSYSTEM_PATH,
  NOTE_ACCOUNT_PATH,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
  WRAP_UNWRAP_PATH,
} from '../constants';
import { Layout } from '../containers';
import Deposit from '../pages/Hubble/Bridge/Deposit';
import SelectChain from '../pages/Hubble/Bridge/SelectChain';
import Transfer from '../pages/Hubble/Bridge/Transfer';
import Withdraw from '../pages/Hubble/Bridge/Withdraw';
import SelectToken from '../pages/Hubble/Bridge/SelectToken';

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
            path={BRIDGE_PATH}
            element={
              <CSuspense>
                <Bridge />
              </CSuspense>
            }
          >
            <Route path={DEPOSIT_PATH} element={<Deposit />}>
              <Route
                path={SELECT_SOURCE_CHAIN_PATH}
                element={<SelectChain chainType="source" />}
              />
              <Route
                path={SELECT_DESTINATION_CHAIN_PATH}
                element={<SelectChain chainType="dest" />}
              />
              <Route path={SELECT_TOKEN_PATH} element={<SelectToken />} />
              <Route
                path={SELECT_SHIELDED_POOL_PATH}
                element={<SelectToken tokenType="shielded" />}
              />
            </Route>
            <Route path={TRANSFER_PATH} element={<Transfer />} />
            <Route path={WITHDRAW_PATH} element={<Withdraw />} />
            <Route path="*" element={<Navigate to={DEPOSIT_PATH} />} />
          </Route>
          <Route
            path={WRAP_UNWRAP_PATH}
            element={
              <CSuspense>
                <WrapAndUnwrap />
              </CSuspense>
            }
          />
          <Route
            path={NOTE_ACCOUNT_PATH}
            element={
              <CSuspense>
                <Account />
              </CSuspense>
            }
          />
          <Route
            path={ECOSYSTEM_PATH}
            element={
              <CSuspense>
                <Ecosystem />
              </CSuspense>
            }
          />
          <Route path="*" element={<Navigate to={BRIDGE_PATH} />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default BridgeRoutes;
