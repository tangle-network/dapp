import { Navigate, Route, Routes } from 'react-router';
import Layout from '../components/Layout';
import BlueprintDetailsPage from '../pages/blueprints/[id]/page';
import BlueprintsLayout from '../pages/blueprints/layout';
import BlueprintsPage from '../pages/blueprints/page';
import Providers from './providers';

function App() {
  return (
    <Providers>
      <Layout>
        <Routes>
          {/* Redirect root to blueprints */}
          <Route path="/" element={<Navigate to="/blueprints" replace />} />

          {/* Blueprints routes */}
          <Route
            path="/blueprints"
            element={
              <BlueprintsLayout>
                <BlueprintsPage />
              </BlueprintsLayout>
            }
          />
          <Route path="/blueprints/:id" element={<BlueprintDetailsPage />} />
        </Routes>
      </Layout>
    </Providers>
  );
}

export default App;
