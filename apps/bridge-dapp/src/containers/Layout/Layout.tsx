import { Transition } from '@headlessui/react';
import {
  Banner,
  Footer,
  SideBarItemProps,
  SideBarFooterType,
  Logo,
  LogoWithoutName,
  SideBar,
} from '@webb-tools/webb-ui-components/components';
import cx from 'classnames';
import { FC, useState } from 'react';
import { Header } from '../../components/Header';
import { ContrastTwoLine, DocumentationIcon, Tangle } from '@webb-tools/icons';
import {
  WEBB_DAPP_NEW_ISSUE_URL,
  WEBB_MKT_URL,
  WEBB_FAUCET_URL,
  STATS_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
} from '../../constants';

const items: SideBarItemProps[] = [
  {
    name: 'Hubble',
    isInternal: true,
    href: '',
    Icon: ContrastTwoLine,
    subItems: [
      {
        name: 'Bridge',
        isInternal: true,
        href: '/bridge',
      },
      {
        name: 'Faucet',
        isInternal: false,
        href: WEBB_FAUCET_URL,
      },
    ],
  },
  {
    name: 'Tangle Network',
    isInternal: false,
    href: '',
    Icon: Tangle,
    subItems: [
      {
        name: 'DKG Explorer',
        isInternal: false,
        href: STATS_URL,
      },
      {
        name: 'Homepage',
        isInternal: false,
        href: TANGLE_MKT_URL,
      },
    ],
  },
];

const footer: SideBarFooterType = {
  name: 'Webb Docs',
  isInternal: false,
  href: WEBB_DOCS_URL,
  Icon: DocumentationIcon,
};

export const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [showBanner, setShowBanner] = useState(true);

  const onCloseHandler = () => {
    setShowBanner(false);
  };

  return (
    <div className="flex flex-col justify-between h-screen min-w-full min-h-full bg-[url('assets/bridge-bg.png')] dark:bg-[url('assets/bridge-dark-bg.png')] bg-top object-fill bg-no-repeat bg-cover">
      <div className="flex flex-1 overflow-hidden">
        <SideBar
          items={items}
          Logo={Logo}
          ClosedLogo={LogoWithoutName}
          logoLink={WEBB_MKT_URL}
          footer={footer}
        />

        <div className="w-full mx-auto flex flex-col justify-between overflow-y-auto">
          <Header />
          <main className="px-4 lg:px-0">{children}</main>
          <div className="px-4">
            <Footer isMinimal className="w-full mx-auto" />
          </div>
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
