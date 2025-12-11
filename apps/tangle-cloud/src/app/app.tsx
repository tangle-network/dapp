import { Navigate, Route, Routes } from 'react-router';
import Layout from '../components/Layout';
import BlueprintDetailsPage from '../pages/blueprints/[id]/page';
import BlueprintsLayout from '../pages/blueprints/layout';
import BlueprintsPage from '../pages/blueprints/page';
import InstancesLayout from '../pages/instances/layout';
import InstancesPage from '../pages/instances/page';
import ServiceDetailPage from '../pages/services/[id]/page';
import Providers from './providers';
import { PagePath } from '../types';
import RegistrationReview from '../pages/registrationReview/page';
import RegistrationLayout from '../pages/registrationReview/layout';
import DeployPage from '../pages/blueprints/[id]/deploy/page';
import OperatorsPage from '../pages/operators/page';
import OperatorsLayout from '../pages/operators/layout';
import OperatorsManagePage from '../pages/operators/manage/page';
import OperatorsManageLayout from '../pages/operators/manage/layout';
import RewardsPage from '../pages/rewards/page';
import RewardsLayout from '../pages/rewards/layout';
import EarningsPage from '../pages/earnings/page';
import EarningsLayout from '../pages/earnings/layout';
import CreateBlueprintPage from '../pages/blueprints/create/page';
import ManageBlueprintsPage from '../pages/blueprints/manage/page';
import NotFoundPage from '../pages/notFound';
import { FC } from 'react';

const App: FC = () => {
  return (
    <Providers>
      <Layout>
        <Routes>
          {/* Redirect root to instances */}
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
            element={
              <RegistrationLayout>
                <RegistrationReview />
              </RegistrationLayout>
            }
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Providers>
  );
};

export default App;
