import { PropsWithChildren } from 'react';
import Header from '../../components/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="max-w-screen-xl px-4 mx-auto space-y-5 md:px-5">
      <Header />

      {children}
    </div>
  );
};

export default Layout;
