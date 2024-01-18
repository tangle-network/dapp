import { Footer } from '@webb-tools/webb-ui-components';
import { getSideBarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import React, { type FC, type PropsWithChildren } from 'react';

import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';
import ChooseWalletTypeModalContainer from '../ChooseWalletTypeModalContainer';
import WalletAndChainContainer from '../WalletAndChainContainer/WalletAndChainContainer';
import { WalletModalContainer } from '../WalletModalContainer';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSideBarInitiallyExpanded = getSideBarStateFromCookie();

  return (
    <div className="flex bg-body h-screen">
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />

      <main className="flex flex-col justify-between flex-1 h-full max-w-[1448px] m-auto px-10 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between py-6 mb-10">
            <div className="flex items-center space-x-4 lg:space-x-0">
              <SideBarMenu />

              <Breadcrumbs />
            </div>

            <WalletAndChainContainer />
          </div>

          {children}

          <WalletModalContainer />

          <ChooseWalletTypeModalContainer />
        </div>

        <Footer isMinimal className="py-8" />
      </main>
    </div>
  );
};

export default Layout;
