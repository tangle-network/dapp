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

        <div className="flex flex-col justify-between w-full gap-6 px-4 mx-auto overflow-y-auto">
          <div className="space-y-6 max-w-[1565px] mx-auto w-full">
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
