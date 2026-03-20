import { PropsWithChildren } from 'react';
import PageLayout from '../../components/PageLayout';

const Layout = ({ children }: PropsWithChildren) => {
  return <PageLayout>{children}</PageLayout>;
};

export default Layout;
