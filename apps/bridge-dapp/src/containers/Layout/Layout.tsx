import { Transition } from '@headlessui/react';
import { ContrastTwoLine } from '@webb-tools/icons';
import {
  Banner,
  Footer,
  SideBar,
} from '@webb-tools/webb-ui-components/components';
import cx from 'classnames';
import { useState, type FC } from 'react';
import { Outlet } from 'react-router';
import { Header } from '../../components/Header';
import { WEBB_FAUCET_URL } from '../../constants';
import useSidebarProps from '../../hooks/useSidebarProps';

const heightClsx = cx('h-screen');

export const Layout: FC = () => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  const sidebarProps = useSidebarProps();

  return (
    <div className={cx('bg-body', heightClsx)}>
      <div className={cx('flex', heightClsx)}>
        <SideBar {...sidebarProps} className="hidden lg:flex !z-0" />

        <div className="flex flex-col w-full mx-auto overflow-y-auto">
          <Transition show={showBanner} className="hidden lg:!block">
            <Banner
              onClose={onCloseHandler}
              Icon={ContrastTwoLine}
              buttonText="ACCESS FAUCET"
              bannerText="Explore Hubble Bridge Beta, get test tokens to experience private bridging."
              buttonProps={{
                href: WEBB_FAUCET_URL,
                target: '_blank',
              }}
            />
          </Transition>

          <div className="flex-1 px-3 md:!px-5 lg:!px-10">
            <div className="max-w-[1565px] mx-auto w-full h-full flex flex-col justify-between">
              <div className="space-y-6">
                <Header />

                <main className="w-full">
                  <Outlet />
                </main>
              </div>

              <Footer isMinimal className="w-full py-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
