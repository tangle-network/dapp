import { Navigate, Route, Routes } from 'react-router';
import Layout from '../components/Layout';
import BlueprintDetailsPage from '../pages/blueprints/[id]/page';
import BlueprintsLayout from '../pages/blueprints/layout';
import BlueprintsPage from '../pages/blueprints/page';
import InstancesLayout from '../pages/instances/layout';
import InstancesPage from '../pages/instances/page';
import Providers from './providers';
import { PagePath } from '../types';

function App() {
  return (
    <Providers>
      <Layout>
        <Routes>
          {/* Redirect root to instances */}
          <Route
            path={PagePath.HOME}
            element={<Navigate to={PagePath.INSTANCES} replace />}
          />

          {/* Instances routes */}
          <Route
            path={PagePath.INSTANCES}
            element={
              <InstancesLayout>
                <InstancesPage />
              </InstancesLayout>
            }
          />

          {/* Blueprints routes */}
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
              element={<BlueprintDetailsPage />}
            />
          </Route>
        </Routes>
      </Layout>
    </Providers>
  );
}

export default App;
