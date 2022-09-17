import { Footer, Header } from '@webb-dapp/page-statistics/components';
import { FC } from 'react';

export const Layout: FC = ({ children }) => {
  return (
    <div className='min-w-full min-h-full'>
      <Header />

      <div className='max-w-[1160px] mx-auto'>{children}</div>

      <Footer />
    </div>
  );
};
