import { Navigate, Route, Routes } from 'react-router';
import Layout from '../containers/Layout';
import DashboardPage from '../pages/dashboard';
import BlueprintsPage from '../pages/blueprints';
import BlueprintDetailsPage from '../pages/blueprints/[id]';
import BridgePage from '../pages/bridge';
import ClaimPage from '../pages/claim';
import ClaimLayout from '../pages/claim/layout';
import ClaimSuccessPage from '../pages/claim/success';
import MigrationClaimPage from '../pages/claim/migration';
import NativeRestakePage from '../pages/native-restake';
import NotFoundPage from '../pages/notFound';
import { PagePath } from '../types';
import Providers from './providers';
import RestakeTabContent from '../containers/restaking/RestakeTabContent';
import LiquidStakingTabContent from '../containers/liquidStaking/LiquidStakingTabContent';
import {
  RestakeAction,
  RestakeTab,
  LiquidStakingAction,
  LiquidStakingTab,
} from '../constants';

function App() {
  return (
    <div>
      <Providers>
        <Layout>
          <Routes>
            <Route
              index
              path={PagePath.DASHBOARD}
              element={<DashboardPage />}
            />

            <Route path={PagePath.CLAIM_AIRDROP} element={<ClaimLayout />}>
              <Route index element={<ClaimPage />} />

              <Route
                path={PagePath.CLAIM_AIRDROP_SUCCESS}
                element={<ClaimSuccessPage />}
              />
            </Route>

            <Route
              path={PagePath.CLAIM_MIGRATION}
              element={<MigrationClaimPage />}
            />

            <Route path={PagePath.BRIDGE} element={<BridgePage />} />

            <Route path={PagePath.BLUEPRINTS}>
              <Route index element={<BlueprintsPage />} />

              <Route
                path={PagePath.BLUEPRINTS_DETAILS}
                element={<BlueprintDetailsPage />}
              />
            </Route>

            <Route path={PagePath.RESTAKE}>
              <Route
                index
                element={<Navigate to={PagePath.RESTAKE_DEPOSIT} replace />}
              />
              <Route
                path={PagePath.RESTAKE_DEPOSIT}
                element={<RestakeTabContent tab={RestakeAction.DEPOSIT} />}
              />
              <Route
                path={PagePath.RESTAKE_DELEGATE}
                element={<RestakeTabContent tab={RestakeAction.DELEGATE} />}
              />
              <Route
                path={PagePath.RESTAKE_UNDELEGATE}
                element={<RestakeTabContent tab={RestakeAction.UNDELEGATE} />}
              />
              <Route
                path={PagePath.RESTAKE_WITHDRAW}
                element={<RestakeTabContent tab={RestakeAction.WITHDRAW} />}
              />
              <Route
                path={PagePath.RESTAKE_VAULT}
                element={<RestakeTabContent tab={RestakeTab.VAULTS} />}
              />
              <Route
                path={PagePath.RESTAKE_OPERATOR}
                element={<RestakeTabContent tab={RestakeTab.OPERATORS} />}
              />
              <Route
                path={PagePath.RESTAKE_BLUEPRINT}
                element={<RestakeTabContent tab={RestakeTab.BLUEPRINTS} />}
              />
            </Route>

            <Route path={PagePath.LIQUID_STAKING}>
              <Route
                index
                element={
                  <Navigate to={PagePath.LIQUID_STAKING_DEPOSIT} replace />
                }
              />
              <Route
                path={PagePath.LIQUID_STAKING_DEPOSIT}
                element={
                  <LiquidStakingTabContent tab={LiquidStakingAction.DEPOSIT} />
                }
              />
              <Route
                path={PagePath.LIQUID_STAKING_REDEEM}
                element={
                  <LiquidStakingTabContent tab={LiquidStakingAction.REDEEM} />
                }
              />
              <Route
                path={PagePath.LIQUID_STAKING_CREATE_VAULT}
                element={
                  <LiquidStakingTabContent
                    tab={LiquidStakingAction.CREATE_VAULT}
                  />
                }
              />
              <Route
                path={PagePath.LIQUID_STAKING_VAULTS}
                element={
                  <LiquidStakingTabContent tab={LiquidStakingTab.VAULTS} />
                }
              />
              <Route
                path={PagePath.LIQUID_STAKING_POSITIONS}
                element={
                  <LiquidStakingTabContent tab={LiquidStakingTab.POSITIONS} />
                }
              />
            </Route>

            <Route
              path={PagePath.NATIVE_RESTAKE}
              element={<NativeRestakePage />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Providers>
    </div>
  );
}

export default App;
