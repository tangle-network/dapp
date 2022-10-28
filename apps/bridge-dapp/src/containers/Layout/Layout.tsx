import { FC } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '@webb-tools/webb-ui-components/components';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-w-full min-h-full">
      <Header />

      <main className="max-w-[960px] w-full mx-auto">{children}</main>

      <Footer className="max-w-[960px] w-full" />
    </div>
  );
};
