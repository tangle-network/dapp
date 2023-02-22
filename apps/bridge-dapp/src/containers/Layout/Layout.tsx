import { Transition } from '@headlessui/react';
import { Banner, Footer } from '@webb-tools/webb-ui-components/components';
import cx from 'classnames';
import { FC, useState } from 'react';
import { Header } from '../../components/Header';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <div className="min-w-full min-h-full">
      <Header />

      <Transition
        show={showBanner}
        className={cx('[transform-style:preserve-3d] origin-top duration-200')}
        leaveFrom={cx('[transform:rotateX(0deg)]')}
        leaveTo={cx('[transform:rotateX(-90deg)]')}
      >
        <Banner
          className="[backface-visibility:hidden]"
          onClose={onCloseHandler}
          dappName="stats"
          buttonText="Report Bug"
          bannerText="Hubble Bridge is in beta version."
          buttonProps={{
            href: 'https://github.com/webb-tools/webb-dapp/issues/new/choose',
            target: '_blank',
          }}
        />
      </Transition>

      <main className="w-full mx-auto">{children}</main>

      <Footer className="max-w-[1160px] w-full" />
    </div>
  );
};
