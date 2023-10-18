import React, { type PropsWithChildren, type FC } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';
import { getSideBarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import { SideBar, SideBarMenu, Breadcrumbs } from '../../components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSideBarInitiallyExpanded = getSideBarStateFromCookie();

  return (
    <>
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />

      <main className="flex flex-col justify-between flex-1 h-full overflow-y-auto max-w-[1448px] m-auto py-4 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 lg:space-x-0">
            <SideBarMenu />

            <Breadcrumbs />
          </div>

          {/* Wallet Connection */}
          <div></div>
        </div>

        {children}

        <Footer isMinimal className="py-3" />
      </main>
    </>
  );
};

export default Layout;
