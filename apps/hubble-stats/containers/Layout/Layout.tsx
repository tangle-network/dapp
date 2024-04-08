import React, { type PropsWithChildren, type FC } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';
import { getSidebarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';

import Header from './Header';
import { SideBar } from '../../components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSideBarInitiallyExpanded = getSidebarStateFromCookie();

  return (
    <>
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />
      <main className="flex-1 h-full px-3 overflow-y-auto md:px-5 lg:px-10">
        <div className="h-full flex flex-col justify-between mx-auto max-w-[1565px]">
          <div>
            {/* Header */}
            <Header />

            {/* Body */}
            {children}
          </div>

          {/* Footer */}
          <Footer isMinimal className="py-12 w-full" />
        </div>
      </main>
    </>
  );
};

export default Layout;
