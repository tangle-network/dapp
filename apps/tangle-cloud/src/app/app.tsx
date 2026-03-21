import { Navigate, Route, Routes } from 'react-router';
import { lazy, Suspense, type FC, type ReactNode } from 'react';
import Layout from '../components/Layout';
import Providers from './providers';
import { PagePath } from '../types';
import { SkeletonLoader } from '@tangle-network/ui-components';

// Layouts (lightweight, no code splitting needed)
import InstancesLayout from '../pages/instances/layout';
import BlueprintsLayout from '../pages/blueprints/layout';
import OperatorsLayout from '../pages/operators/layout';
import OperatorsManageLayout from '../pages/operators/manage/layout';
import RewardsLayout from '../pages/rewards/layout';
import EarningsLayout from '../pages/earnings/layout';
import PaymentsLayout from '../pages/payments/layout';

// Pages (lazy-loaded for code splitting)
const InstancesPage = lazy(() => import('../pages/instances/page'));
const ServiceDetailPage = lazy(() => import('../pages/services/[id]/page'));
const BlueprintsPage = lazy(() => import('../pages/blueprints/page'));
const BlueprintDetailsPage = lazy(
  () => import('../pages/blueprints/[id]/page'),
);
const DeployPage = lazy(() => import('../pages/blueprints/[id]/deploy/page'));
const CreateBlueprintPage = lazy(
  () => import('../pages/blueprints/create/page'),
);
const ManageBlueprintsPage = lazy(
  () => import('../pages/blueprints/manage/page'),
);
const OperatorsPage = lazy(() => import('../pages/operators/page'));
const OperatorsManagePage = lazy(
  () => import('../pages/operators/manage/page'),
);
const RewardsPage = lazy(() => import('../pages/rewards/page'));
const EarningsPage = lazy(() => import('../pages/earnings/page'));
const PaymentsPoolPage = lazy(() => import('../pages/payments/pool'));
const PaymentsCreditsPage = lazy(() => import('../pages/payments/credits'));
const NotFoundPage = lazy(() => import('../pages/notFound'));

const PageFallback = () => (
  <div className="space-y-4 mt-4">
    <SkeletonLoader className="h-8 w-48" />
    <SkeletonLoader className="h-4 w-96" />
    <SkeletonLoader className="h-64 w-full rounded-xl" />
  </div>
);

// Wrap lazy page in layout + Suspense so layout (with Header) stays visible during load
const withLayout = (LayoutCmp: FC<{ children: ReactNode }>, Page: FC) => (
  <LayoutCmp>
    <Suspense fallback={<PageFallback />}>
      <Page />
    </Suspense>
  </LayoutCmp>
);

const App: FC = () => {
  return (
    <Providers>
      <Layout>
        <Routes>
          <Route
            path={PagePath.HOME}
            element={<Navigate to={PagePath.INSTANCES} replace />}
          />

          <Route
            path={PagePath.INSTANCES}
            element={withLayout(InstancesLayout, InstancesPage)}
          />

          <Route
            path={PagePath.SERVICE_DETAILS}
            element={withLayout(InstancesLayout, ServiceDetailPage)}
          />

          <Route
            path={PagePath.SERVICE_DETAILS}
            element={
              <InstancesLayout>
                <ServiceDetailPage />
              </InstancesLayout>
            }
          />

          <Route path={PagePath.BLUEPRINTS}>
            <Route
              path={PagePath.BLUEPRINTS}
              element={withLayout(BlueprintsLayout, BlueprintsPage)}
            />

            <Route
              path={PagePath.BLUEPRINTS_CREATE}
              element={withLayout(BlueprintsLayout, CreateBlueprintPage)}
            />

            <Route
              path={PagePath.BLUEPRINTS_MANAGE}
              element={withLayout(BlueprintsLayout, ManageBlueprintsPage)}
            />

            <Route
              path={PagePath.BLUEPRINTS_CREATE}
              element={
                <BlueprintsLayout>
                  <CreateBlueprintPage />
                </BlueprintsLayout>
              }
            />

            <Route
              path={PagePath.BLUEPRINTS_MANAGE}
              element={
                <BlueprintsLayout>
                  <ManageBlueprintsPage />
                </BlueprintsLayout>
              }
            />

            <Route
              path={PagePath.BLUEPRINTS_DETAILS}
              element={withLayout(BlueprintsLayout, BlueprintDetailsPage)}
            />

            <Route
              path={PagePath.BLUEPRINTS_DEPLOY}
              element={withLayout(BlueprintsLayout, DeployPage)}
            />
          </Route>

          {/* Redirect old registration review page to blueprints */}
          <Route
            path={PagePath.BLUEPRINTS_REGISTRATION_REVIEW}
            element={<Navigate to={PagePath.BLUEPRINTS} replace />}
          />

          <Route
            path={PagePath.OPERATORS}
            element={withLayout(OperatorsLayout, OperatorsPage)}
          />

          <Route
            path={PagePath.OPERATORS_MANAGE}
            element={withLayout(OperatorsManageLayout, OperatorsManagePage)}
          />

          <Route
            path={PagePath.REWARDS}
            element={withLayout(RewardsLayout, RewardsPage)}
          />

          <Route
            path={PagePath.EARNINGS}
            element={withLayout(EarningsLayout, EarningsPage)}
          />

          {/* /payments → redirect to pool */}
          <Route
            path="/payments"
            element={<Navigate to={PagePath.PAYMENTS_POOL} replace />}
          />

          <Route
            path={PagePath.PAYMENTS_POOL}
            element={withLayout(PaymentsLayout, PaymentsPoolPage)}
          />

          <Route
            path={PagePath.PAYMENTS_CREDITS}
            element={withLayout(PaymentsLayout, PaymentsCreditsPage)}
          />

          <Route
            path="*"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>
      </Layout>
    </Providers>
  );
};

export default App;
