import { PropsWithChildren } from 'react';
import PageLayout from '../../components/PageLayout';

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <PageLayout className="md:px-8 lg:px-10 relative">{children}</PageLayout>
  );
};

export default Layout;
