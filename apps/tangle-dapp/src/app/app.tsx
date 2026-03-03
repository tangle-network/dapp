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
import NativeStakingPage from '../pages/native-staking';
import NotFoundPage from '../pages/notFound';
import { PagePath } from '../types';
import Providers from './providers';
import StakingTabContent from '../containers/staking/StakingTabContent';
import LiquidStakingTabContent from '../containers/liquidStaking/LiquidStakingTabContent';
import {
  StakingAction,
  StakingTab,
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

            <Route path={PagePath.STAKING}>
              <Route
                index
                element={<Navigate to={PagePath.STAKING_DEPOSIT} replace />}
              />
              <Route
                path={PagePath.STAKING_DEPOSIT}
                element={<StakingTabContent tab={StakingAction.DEPOSIT} />}
              />
              <Route
                path={PagePath.STAKING_DELEGATE}
                element={<StakingTabContent tab={StakingAction.DELEGATE} />}
              />
              <Route
                path={PagePath.STAKING_UNDELEGATE}
                element={<StakingTabContent tab={StakingAction.UNDELEGATE} />}
              />
              <Route
                path={PagePath.STAKING_WITHDRAW}
                element={<StakingTabContent tab={StakingAction.WITHDRAW} />}
              />
              <Route
                path={PagePath.STAKING_VAULT}
                element={<StakingTabContent tab={StakingTab.VAULTS} />}
              />
              <Route
                path={PagePath.STAKING_OPERATOR}
                element={<StakingTabContent tab={StakingTab.OPERATORS} />}
              />
              <Route
                path={PagePath.STAKING_BLUEPRINT}
                element={<StakingTabContent tab={StakingTab.BLUEPRINTS} />}
              />
              <Route
                path={PagePath.STAKING_REWARDS}
                element={<StakingTabContent tab={StakingTab.REWARDS} />}
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
              path={PagePath.NATIVE_STAKING}
              element={<NativeStakingPage />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Providers>
    </div>
  );
}

export default App;
