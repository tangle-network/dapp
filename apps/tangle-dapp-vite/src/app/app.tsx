import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles.css';

import { Route, Routes, Link } from 'react-router';
import Providers from './providers';
import { Layout } from '../containers';
import AccountPage from '../pages/account';

export function App() {
  return (
    <div>
      {/* START: routes */}
      {/* These routes and navigation have been generated for you */}
      {/* Feel free to move and update them to fit your needs */}
      <Providers>
        <Layout>
          <Routes>
            <Route path="/" element={<AccountPage />} />
            <Route
              path="/page-2"
              element={
                <div>
                  <Link to="/">Click here to go back to root page.</Link>
                </div>
              }
            />
          </Routes>
        </Layout>
      </Providers>
      {/* END: routes */}
    </div>
  );
}
export default App;
