import { Navigate, Route, Routes } from 'react-router';
import { lazy, Suspense, type FC } from 'react';
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
  <div className="max-w-screen-xl px-4 mx-auto mt-12 space-y-4 md:px-8 lg:px-10">
    <SkeletonLoader className="h-8 w-48" />
    <SkeletonLoader className="h-4 w-96" />
    <SkeletonLoader className="h-64 w-full rounded-xl" />
  </div>
);

const App: FC = () => {
  return (
    <Providers>
      <Layout>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route
              path={PagePath.HOME}
              element={<Navigate to={PagePath.INSTANCES} replace />}
            />

            <Route
              path={PagePath.INSTANCES}
              element={
                <InstancesLayout>
                  <InstancesPage />
                </InstancesLayout>
              }
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
                element={
                  <BlueprintsLayout>
                    <BlueprintsPage />
                  </BlueprintsLayout>
                }
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
                element={
                  <BlueprintsLayout>
                    <BlueprintDetailsPage />
                  </BlueprintsLayout>
                }
              />

              <Route
                path={PagePath.BLUEPRINTS_DEPLOY}
                element={
                  <BlueprintsLayout>
                    <DeployPage />
                  </BlueprintsLayout>
                }
              />
            </Route>

            <Route
              path={PagePath.BLUEPRINTS_REGISTRATION_REVIEW}
              element={<Navigate to={PagePath.BLUEPRINTS} replace />}
            />

            <Route
              path={PagePath.OPERATORS}
              element={
                <OperatorsLayout>
                  <OperatorsPage />
                </OperatorsLayout>
              }
            />

            <Route
              path={PagePath.OPERATORS_MANAGE}
              element={
                <OperatorsManageLayout>
                  <OperatorsManagePage />
                </OperatorsManageLayout>
              }
            />

            <Route
              path={PagePath.REWARDS}
              element={
                <RewardsLayout>
                  <RewardsPage />
                </RewardsLayout>
              }
            />

            <Route
              path={PagePath.EARNINGS}
              element={
                <EarningsLayout>
                  <EarningsPage />
                </EarningsLayout>
              }
            />

            <Route
              path={PagePath.PAYMENTS_POOL}
              element={
                <PaymentsLayout>
                  <PaymentsPoolPage />
                </PaymentsLayout>
              }
            />

            <Route
              path={PagePath.PAYMENTS_CREDITS}
              element={
                <PaymentsLayout>
                  <PaymentsCreditsPage />
                </PaymentsLayout>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Providers>
  );
};

export default App;
