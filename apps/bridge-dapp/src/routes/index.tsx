import RequireNoteAccountRoute from '@webb-tools/api-provider-environment/RequireNoteAccountRoute';
import CSuspense from '@webb-tools/webb-ui-components/components/Suspense';
import { AnimatePresence } from 'framer-motion';
import qs from 'query-string';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import {
  ACCOUNT_TRANSACTIONS_PATH,
  BRIDGE_PATH,
  DEPOSIT_PATH,
  ECOSYSTEM_PATH,
  NOTE_ACCOUNT_PATH,
  SELECT_DESTINATION_CHAIN_PATH,
  SELECT_RELAYER_PATH,
  SELECT_SHIELDED_POOL_PATH,
  SELECT_SOURCE_CHAIN_PATH,
  SELECT_TOKEN_PATH,
  TRANSFER_PATH,
  WITHDRAW_PATH,
  WRAPPER_PATH,
  WRAP_PATH,
  UNWRAP_PATH,
  SELECT_SOURCE_TOKEN_PATH,
  SELECT_DESTINATION_TOKEN_PATH,
} from '../constants';
import { Layout } from '../containers';
import Deposit from '../pages/Hubble/Bridge/Deposit';
import SelectChain from '../pages/Hubble/Bridge/SelectChain';
import SelectPool from '../pages/Hubble/Bridge/SelectPool';
import SelectRelayer from '../pages/Hubble/Bridge/SelectRelayer';
import BridgeSelectToken from '../pages/Hubble/Bridge/SelectToken';
import Transfer from '../pages/Hubble/Bridge/Transfer';
import Withdraw from '../pages/Hubble/Bridge/Withdraw';

import WrapperSelectToken from '../pages/Hubble/Wrapper/SelectToken';

const HubbleWrapper = lazy(() => import('../containers/HubbleContainer'));
const Wrap = lazy(() => import('../pages/Hubble/Wrapper/Wrap'));
const Unwrap = lazy(() => import('../pages/Hubble/Wrapper/Unwrap'));
const Account = lazy(() => import('../pages/Account'));
const AccountTransactions = lazy(() => import('../pages/Account/Transactions'));
const AccountTransactionDetail = lazy(
  () => import('../pages/Account/Transactions/TransactionDetail'),
);
const Ecosystem = lazy(() => import('../pages/Ecosystem'));

const AppRoutes = () => {
  return (
    <AnimatePresence>
      <HashRouter>
        <QueryParamProvider
          adapter={ReactRouter6Adapter}
          options={{
            searchStringToObject: qs.parse,
            objectToSearchString: (encodedParams) =>
              qs.stringify(encodedParams, {
                skipEmptyString: true,
                skipNull: true,
              }),
            updateType: 'replaceIn',
          }}
        >
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
                    <HubbleWrapper />
                  </CSuspense>
                }
              >
                {/** Deposit */}
                <Route path={DEPOSIT_PATH} element={<Deposit />}>
                  <Route
                    path={SELECT_SOURCE_CHAIN_PATH}
                    element={<SelectChain chainType="source" />}
                  />
                  <Route
                    path={SELECT_DESTINATION_CHAIN_PATH}
                    element={<SelectChain chainType="dest" />}
                  />
                  <Route
                    path={SELECT_TOKEN_PATH}
                    element={<BridgeSelectToken />}
                  />
                  <Route
                    path={SELECT_SHIELDED_POOL_PATH}
                    element={<SelectPool />}
                  />
                </Route>

                {/** Transfer */}
                <Route path={TRANSFER_PATH} element={<Transfer />}>
                  <Route
                    path={SELECT_SOURCE_CHAIN_PATH}
                    element={<SelectChain chainType="source" />}
                  />
                  <Route
                    path={SELECT_DESTINATION_CHAIN_PATH}
                    element={<SelectChain chainType="dest" />}
                  />
                  <Route
                    path={SELECT_SHIELDED_POOL_PATH}
                    element={<SelectPool />}
                  />
                  <Route
                    path={SELECT_RELAYER_PATH}
                    element={<SelectRelayer />}
                  />
                </Route>

                {/** Withdraw */}
                <Route path={WITHDRAW_PATH} element={<Withdraw />}>
                  <Route
                    path={SELECT_SOURCE_CHAIN_PATH}
                    element={<SelectChain chainType="source" />}
                  />
                  <Route
                    path={SELECT_SHIELDED_POOL_PATH}
                    element={<SelectPool />}
                  />
                  <Route
                    path={SELECT_TOKEN_PATH}
                    element={<BridgeSelectToken />}
                  />
                  <Route
                    path={SELECT_RELAYER_PATH}
                    element={<SelectRelayer />}
                  />
                </Route>

                <Route path="*" element={<Navigate to={DEPOSIT_PATH} />} />
              </Route>

              <Route
                path={WRAPPER_PATH}
                element={
                  <CSuspense>
                    <HubbleWrapper />
                  </CSuspense>
                }
              >
                <Route
                  path={WRAP_PATH}
                  element={
                    <CSuspense>
                      <Wrap />
                    </CSuspense>
                  }
                >
                  <Route
                    path={SELECT_SOURCE_CHAIN_PATH}
                    element={<SelectChain chainType="source" />}
                  />
                  <Route
                    path={SELECT_SOURCE_TOKEN_PATH}
                    element={<WrapperSelectToken type="src" />}
                  />
                  <Route
                    path={SELECT_DESTINATION_TOKEN_PATH}
                    element={<WrapperSelectToken type="dest" />}
                  />
                </Route>
                <Route
                  path={UNWRAP_PATH}
                  element={
                    <CSuspense>
                      <Unwrap />
                    </CSuspense>
                  }
                >
                  <Route
                    path={SELECT_SOURCE_CHAIN_PATH}
                    element={<SelectChain chainType="source" />}
                  />
                  <Route
                    path={SELECT_SOURCE_TOKEN_PATH}
                    element={<WrapperSelectToken type="src" />}
                  />
                  <Route
                    path={SELECT_DESTINATION_TOKEN_PATH}
                    element={<WrapperSelectToken type="dest" />}
                  />
                </Route>
                <Route path="*" element={<Navigate to={WRAP_PATH} />} />
              </Route>

              <Route path={NOTE_ACCOUNT_PATH}>
                <Route
                  index={true}
                  element={
                    <CSuspense>
                      <RequireNoteAccountRoute redirect={`/${BRIDGE_PATH}`}>
                        <Account />
                      </RequireNoteAccountRoute>
                    </CSuspense>
                  }
                />
                <Route
                  path={ACCOUNT_TRANSACTIONS_PATH}
                  element={
                    <CSuspense>
                      <RequireNoteAccountRoute redirect={`/${BRIDGE_PATH}`}>
                        <AccountTransactions />
                      </RequireNoteAccountRoute>
                    </CSuspense>
                  }
                >
                  <Route
                    path=":txHash"
                    element={
                      <CSuspense>
                        <RequireNoteAccountRoute redirect={`/${BRIDGE_PATH}`}>
                          <AccountTransactionDetail />
                        </RequireNoteAccountRoute>
                      </CSuspense>
                    }
                  />
                </Route>
              </Route>

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
        </QueryParamProvider>
      </HashRouter>
    </AnimatePresence>
  );
};

export default AppRoutes;
