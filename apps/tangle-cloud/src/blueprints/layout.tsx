import { PropsWithChildren } from 'react';
import Header from '../components/Header';

export const dynamic = 'force-static';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="max-w-screen-xl px-4 mx-auto space-y-5 md:px-8 lg:px-10">
      <Header />

      {children}
    </div>
  );
};

export default Layout;
