// Import global styles.
import '@tangle-network/ui-components/tailwind.css';
import '../styles.css';

import { Route, Routes } from 'react-router';
import Layout from '../containers/Layout';
import DashboardPage from '../pages/dashboard';
import BlueprintsPage from '../pages/blueprints';
import BlueprintDetailsPage from '../pages/blueprints/[id]';
import BridgePage from '../pages/bridge';
import ClaimPage from '../pages/claim';
import ClaimLayout from '../pages/claim/layout';
import ClaimSuccessPage from '../pages/claim/success';
import LiquidStakingPage from '../pages/liquid-staking';
import NominationPage from '../pages/nomination';
import ValidatorDetailsPage from '../pages/nomination/[validatorAddress]';
import NominationLayout from '../pages/nomination/layout';
import NotFoundPage from '../pages/notFound';
import RestakePage from '../pages/restake';
import { PagePath } from '../types';
import Providers from './providers';

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

            <Route path={PagePath.NOMINATION} element={<NominationLayout />}>
              <Route index element={<NominationPage />} />

              <Route
                path={PagePath.NOMINATION_VALIDATOR}
                element={<ValidatorDetailsPage />}
              />
            </Route>

            <Route path={PagePath.BRIDGE} element={<BridgePage />} />

            <Route path={PagePath.BLUEPRINTS}>
              <Route index element={<BlueprintsPage />} />

              <Route
                path={PagePath.BLUEPRINTS_DETAILS}
                element={<BlueprintDetailsPage />}
              />
            </Route>

            <Route
              path={PagePath.LIQUID_STAKING}
              element={<LiquidStakingPage />}
            />

            <Route path={`${PagePath.RESTAKE}`} element={<RestakePage />} />

            <Route
              path={`${PagePath.RESTAKE}/:action`}
              element={<RestakePage />}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Providers>
    </div>
  );
}

export default App;
