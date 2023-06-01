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
    <div className="h-screen min-w-full min-h-full flex flex-col justify-between">
      <div className="flex-[1] flex flex-col">
        <Header />

        <Transition
          show={showBanner}
          className={cx(
            'hidden lg:block [transform-style:preserve-3d] origin-top duration-300 h-[60px]'
          )}
          leaveFrom={cx('[transform:rotateX(0deg)]', 'h-[60px]')}
          leaveTo={cx('[transform:rotateX(-180deg)]', 'h-0')}
        >
          <Banner
            className="[backface-visibility:hidden] h-full"
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

        <div
          className={cx(
            'w-full mx-auto flex-1',
            "bg-[url('assets/bridge-bg.png')] dark:bg-[url('assets/bridge-dark-bg.png')]",
            'bg-top object-fill bg-no-repeat bg-cover'
          )}
        >
          <main>{children}</main>
          <div className="px-4 lg:px-0 !bg-inherit">
            <Footer isMinimal className="max-w-[1160px] w-full !bg-inherit" />
          </div>
        </div>
      </div>
    </div>
  );
};
