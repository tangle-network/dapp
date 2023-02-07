import { FC, useState } from 'react';
import { Header } from '../../components/Header';
import { Banner, Footer } from '@webb-tools/webb-ui-components/components';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <div className="min-w-full min-h-full">
      <Header />

      {showBanner && (
        <Banner
          onClose={onCloseHandler}
          dappName="stats"
          buttonText="Report Bug"
          bannerText="Hubble Bridge is in beta version."
          buttonProps={{
            href: 'https://github.com/webb-tools/webb-dapp/issues/new/choose',
            target: '_blank',
          }}
        />
      )}

      <main className="max-w-[960px] w-full mx-auto">{children}</main>

      <Footer className="max-w-[960px] w-full" />
    </div>
  );
};
