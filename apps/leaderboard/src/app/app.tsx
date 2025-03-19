import { Footer } from '@tangle-network/ui-components/components/Footer';
import { Route, Routes } from 'react-router-dom';
import Header from '../components/Header';
import IndexPage from '../pages/index';
import Providers from './providers';
import NotFoundPage from '../pages/notFound';

export function App() {
  return (
    <div className="container flex flex-col min-h-screen gap-6 px-6 mx-auto">
      <Header className="flex-initial" />

      <Providers>
        <main className="flex-auto">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </Providers>

      <Footer className="flex-initial" logoType="tangle" isMinimal />
    </div>
  );
}
export default App;
