import { PropsWithChildren } from 'react';
import PageLayout from '../../components/PageLayout';

const PaymentsLayout = ({ children }: PropsWithChildren) => {
  return <PageLayout>{children}</PageLayout>;
};

export default PaymentsLayout;
