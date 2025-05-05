import { Navigate, Route, Routes } from 'react-router';
import Layout from '../components/Layout';
import BlueprintDetailsPage from '../pages/blueprints/[id]/page';
import BlueprintsLayout from '../pages/blueprints/layout';
import BlueprintsPage from '../pages/blueprints/page';
import InstancesLayout from '../pages/instances/layout';
import InstancesPage from '../pages/instances/page';
import Providers from './providers';
import { PagePath } from '../types';
import RegistrationReview from '../pages/registrationReview/page';
import RegistrationLayout from '../pages/registrationReview/layout';
import DeployPage from '../pages/blueprints/[id]/deploy/page';
import OperatorsPage from '../pages/operators/page';
import OperatorsLayout from '../pages/operators/layout';
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Providers>
  );
};

export default App;
