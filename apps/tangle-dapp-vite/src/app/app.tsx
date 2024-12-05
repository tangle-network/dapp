import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles.css';

import { Route, Routes } from 'react-router';
import { Layout } from '../containers';
import AccountPage from '../pages/account';
import ClaimPage from '../pages/claim';
import ClaimLayout from '../pages/claim/layout';
import ClaimSuccessPage from '../pages/claim/success';
import NominationPage from '../pages/nomination';
import ValidatorDetailsPage from '../pages/nomination/[validatorAddress]';
import NominationLayout from '../pages/nomination/layout';
import { PagePath } from '../types';
import Providers from './providers';

// TODO: Add metadata tags for SEO

export function App() {
  return (
    <div>
      <Providers>
        <Layout>
          {/* START: routes */}
          <Routes>
            <Route path={PagePath.ACCOUNT} element={<AccountPage />} />

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
          </Routes>
          {/* END: routes */}
        </Layout>
      </Providers>
    </div>
  );
}
export default App;
