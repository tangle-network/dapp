import { PropsWithChildren } from 'react';
import Header from '../../components/Header';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <div className="max-w-screen-xl mx-auto my-5">
      <Header />

      {children}
    </div>
  );
};

export default Layout;
