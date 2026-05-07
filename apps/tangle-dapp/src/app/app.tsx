import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import Layout from '../containers/Layout';
import DashboardPage from '../pages/dashboard';
import { PagePath } from '../types';
import Providers from './providers';
import {
  StakingAction,
  StakingTab,
  LiquidStakingAction,
  LiquidStakingTab,
} from '../constants';
import Spinner from '@tangle-network/icons/Spinner';
import { SkeletonLoader } from '@tangle-network/ui-components';

// Pages (lazy-loaded for code splitting). Dashboard stays eager — it's the
// cold-load entry, lazy-loading it would cause a fallback flash.
const BlueprintsPage = lazy(() => import('../pages/blueprints'));
const BlueprintDetailsPage = lazy(() => import('../pages/blueprints/[id]'));
const BridgePage = lazy(() => import('../pages/bridge'));
const NotFoundPage = lazy(() => import('../pages/notFound'));
const MigrationClaimPage = lazy(() => import('../pages/claim/migration'));
const StakingTabContent = lazy(
  () => import('../containers/staking/StakingTabContent'),
);
const LiquidStakingTabContent = lazy(
  () => import('../containers/liquidStaking/LiquidStakingTabContent'),
);

const RouteFallback = () => (
  <div className="mt-4 space-y-4">
    <SkeletonLoader className="h-8 w-48 rounded-md" />
    <SkeletonLoader className="h-4 w-96 max-w-full rounded-md" />
    <SkeletonLoader className="h-64 w-full rounded-lg" />
  </div>
);

function App() {
  return (
    <div>
      <Providers>
        <Layout>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route
                index
                path={PagePath.DASHBOARD}
                element={<DashboardPage />}
              />

              <Route
                path={PagePath.CLAIM}
                element={
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center py-16">
                        <Spinner size="xl" />
                      </div>
                    }
                  >
                    <MigrationClaimPage />
                  </Suspense>
                }
              />
              <Route
                path={PagePath.CLAIM_MIGRATION}
                element={<Navigate to={PagePath.CLAIM} replace />}
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
                    <LiquidStakingTabContent
                      tab={LiquidStakingAction.DEPOSIT}
                    />
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

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </Providers>
    </div>
  );
}

export default App;
