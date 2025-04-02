import { TANGLE_MKT_URL, TangleLogo } from '@tangle-network/ui-components';
import { Footer } from '@tangle-network/ui-components/components/Footer';
import { ComponentProps } from 'react';
import { Link, Route, Routes } from 'react-router';
import { twMerge } from 'tailwind-merge';
import IndexPage from '../pages/index';
import NotFoundPage from '../pages/notFound';
import { Navbar } from './Navbar';
import Providers from './providers';

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

const Header = ({ className, ...props }: ComponentProps<'header'>) => {
  return (
    <header {...props} className={twMerge('py-6', className)}>
      <div className="flex items-center justify-between">
        <Link to={TANGLE_MKT_URL}>
          <TangleLogo />
        </Link>

        <Navbar />
      </div>
    </header>
  );
};
