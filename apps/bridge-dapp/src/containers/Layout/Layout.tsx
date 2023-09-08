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
import { WEBB_DAPP_NEW_ISSUE_URL } from '../../constants';
import sidebarProps from '../../constants/sidebar';

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <div className="flex flex-col justify-between h-screen min-w-full min-h-full bg-[url('assets/bridge-bg.png')] dark:bg-[url('assets/bridge-dark-bg.png')] bg-top object-fill bg-no-repeat bg-cover">
      <div className="flex flex-1 overflow-hidden">
        <SideBar {...sidebarProps} className="hidden lg:flex" />

        <div className="flex flex-col w-full mx-auto overflow-y-auto px-4 max-w-[1565px] gap-6 justify-between">
          <div className="space-y-6">
            <Header />
            <main className="w-full">
              <Outlet />
            </main>
          </div>

          <Footer isMinimal className="w-full py-12 mx-auto" />
        </div>
      </div>

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
            href: WEBB_DAPP_NEW_ISSUE_URL,
            target: '_blank',
          }}
        />
      </Transition>
    </div>
  );
};
