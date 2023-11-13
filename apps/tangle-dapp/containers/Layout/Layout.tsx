import { Footer } from '@webb-tools/webb-ui-components';
import { getSideBarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import React, { type FC, type PropsWithChildren } from 'react';

import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';
import WalletAndChainCointainer from '../WalletAndChainContainer/WalletAndChainContainer';
import { WalletModalContainer } from '../WalletModalContainer';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSideBarInitiallyExpanded = getSideBarStateFromCookie();

  return (
    <>
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />

      <main className="flex flex-col justify-between flex-1 h-full overflow-y-auto max-w-[1448px] m-auto px-10">
        <div className="flex flex-col justify-between">
          <div className="flex items-center justify-between py-6 mb-10">
            <div className="flex items-center space-x-4 lg:space-x-0">
              <SideBarMenu />

              <Breadcrumbs />
            </div>

            <WalletAndChainCointainer />
          </div>

          {children}

          <WalletModalContainer />
        </div>

        <Footer isMinimal className="py-8" />
      </main>
    </>
  );
};

export default Layout;
