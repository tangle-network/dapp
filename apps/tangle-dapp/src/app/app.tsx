import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles.css';

import { Navigate, Route, Routes } from 'react-router';
import { Layout } from '../containers';
import AccountPage from '../pages/account';
import ClaimPage from '../pages/claim';
import ClaimLayout from '../pages/claim/layout';
import ClaimSuccessPage from '../pages/claim/success';
import NominationPage from '../pages/nomination';
import ValidatorDetailsPage from '../pages/nomination/[validatorAddress]';
import NominationLayout from '../pages/nomination/layout';
import BridgeLayout from '../pages/bridge/layout';
import BridgePage from '../pages/bridge';
import { PagePath } from '../types';
import Providers from './providers';
import BlueprintLayout from '../pages/blueprints/layout';
import BlueprintsPage from '../pages/blueprints';
import BlueprintDetailsPage from '../pages/blueprints/[id]';
import LiquidStakingPage from '../pages/liquid-staking';
import RestakeLayout from '../pages/restake/layout';
import RestakeOverviewPage from '../pages/restake/overview';
import RestakeOperatorPage from '../pages/restake/operators/[address]';
import RestakeDepositPage from '../pages/restake/deposit';
import RestakeStakePage from '../pages/restake/stake';
import RestakeUnstakePage from '../pages/restake/unstake';
import RestakeWithdrawPage from '../pages/restake/withdraw';

// TODO: Add metadata tags for SEO

export function App() {
  return (
    <div>
      <Providers>
        <Layout>
          {/* START: routes */}
          <Routes>
            <Route path={PagePath.DASHBOARD} element={<AccountPage />} />

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

            <Route path={PagePath.BRIDGE} element={<BridgeLayout />}>
              <Route index element={<BridgePage />} />
            </Route>

            <Route path={PagePath.BLUEPRINTS} element={<BlueprintLayout />}>
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

            <Route path={PagePath.RESTAKE} element={<RestakeLayout />}>
              <Route
                index
                element={<Navigate to={PagePath.RESTAKE_OVERVIEW} />}
              />

              <Route
                path={PagePath.RESTAKE_OVERVIEW}
                element={<RestakeOverviewPage />}
              />

              <Route
                path={`${PagePath.RESTAKE_OPERATOR}/:address`}
                element={<RestakeOperatorPage />}
              />

              <Route
                path={PagePath.RESTAKE_DEPOSIT}
                element={<RestakeDepositPage />}
              />

              <Route
                path={PagePath.RESTAKE_STAKE}
                element={<RestakeStakePage />}
              />

              <Route
                path={PagePath.RESTAKE_UNSTAKE}
                element={<RestakeUnstakePage />}
              />

              <Route
                path={PagePath.RESTAKE_WITHDRAW}
                element={<RestakeWithdrawPage />}
              />
            </Route>
          </Routes>
          {/* END: routes */}
        </Layout>
      </Providers>
    </div>
  );
}
export default App;
