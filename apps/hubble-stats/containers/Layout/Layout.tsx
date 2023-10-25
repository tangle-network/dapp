import React, { type PropsWithChildren, type FC } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';
import { getSideBarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';

import Header from './Header';
import { SideBar } from '../../components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const isSideBarInitiallyExpanded = getSideBarStateFromCookie();

  return (
    <>
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />
      <main className="flex flex-col justify-between flex-1 h-full px-3 overflow-y-auto md:px-5 lg:px-10">
        <div className="flex-[1]">
          {/* Header */}
          <Header />

          {/* Body */}
          {children}
        </div>

        {/* Footer */}
        <Footer isMinimal className="py-12 mx-0 max-w-none" />
      </main>
    </>
  );
};

export default Layout;
