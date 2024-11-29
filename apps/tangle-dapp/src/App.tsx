import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const RestakePage = lazy(() => import('./pages/restake/page'));
const BridgePage = lazy(() => import('./pages/bridge/page'));
const ClaimPage = lazy(() => import('./pages/claim/page'));
const BlueprintsPage = lazy(() => import('./pages/blueprints/page'));
const NominationPage = lazy(() => import('./pages/nomination/page'));
const LiquidStakingPage = lazy(() => import('./pages/liquid-staking/page'));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Navigate to="/restake" replace />} />
        <Route path="/restake" element={<RestakePage />} />
        <Route path="/bridge" element={<BridgePage />} />
        <Route path="/claim" element={<ClaimPage />} />
        <Route path="/blueprints" element={<BlueprintsPage />} />
        <Route path="/nomination" element={<NominationPage />} />
        <Route path="/liquid-staking" element={<LiquidStakingPage />} />
      </Routes>
    </Suspense>
  );
}
