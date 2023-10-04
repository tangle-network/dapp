import { Transition } from '@headlessui/react';
import {
  Banner,
  Footer,
  SideBar,
} from '@webb-tools/webb-ui-components/components';
import cx from 'classnames';
import { FC, useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from '../../components/Header';
import { WEBB_FAUCET_URL } from '../../constants';
import sidebarProps from '../../constants/sidebar';

const heightClsx = cx('h-screen');

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <div className={cx('bg-body', heightClsx)}>
      <div className={cx('flex', heightClsx)}>
        <SideBar {...sidebarProps} className="hidden lg:flex" />

        <div className="flex flex-col justify-between w-full mx-auto overflow-y-auto">
          <Transition show={showBanner}>
            <Banner
              className="py-2"
              onClose={onCloseHandler}
              dappName="bridge"
              buttonText="ACCESS FAUCET"
              bannerText="Explore Hubble Bridge Beta, get test tokens to experience private bridging."
              buttonProps={{
                href: WEBB_FAUCET_URL,
                target: '_blank',
              }}
            />
          </Transition>

          <div className="space-y-6 max-w-[1565px] mx-auto w-full px-10">
            <Header />

            <main className="w-full">
              <Outlet />
            </main>

            <Footer isMinimal className="w-full py-12" />
          </div>
        </div>
      </div>
    </div>
  );
};
