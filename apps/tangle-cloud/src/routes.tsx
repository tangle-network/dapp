import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import BlueprintsPage from './blueprints/page';
import BlueprintDetails from './blueprints/BlueprintDetails';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Redirect from root to blueprints */}
        <Route path="/" element={<Navigate to="/blueprints" replace />} />

        {/* Blueprints routes */}
        <Route path="/blueprints" element={<BlueprintsPage />} />
        <Route path="/blueprints/:id" element={<BlueprintDetails />} />
      </Route>
    </Routes>
  );
}
