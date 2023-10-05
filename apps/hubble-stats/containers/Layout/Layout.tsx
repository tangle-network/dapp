import React, { type PropsWithChildren } from 'react';
import { cookies } from 'next/headers';
import { Footer } from '@webb-tools/webb-ui-components';

import { HeaderChipsContainer } from '..';
import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';

export default async function Layout({ children }: PropsWithChildren) {
  const cookieStore = cookies();
  const sideBarStateFromCookie = cookieStore.get('isSidebarOpen');
  const isSideBarInitiallyExpanded =
    sideBarStateFromCookie === undefined
      ? undefined
      : sideBarStateFromCookie.value === 'true'
      ? true
      : false;

  return (
    <>
      <SideBar isExpandedAtDefault={isSideBarInitiallyExpanded} />
      <main className="flex flex-col justify-between flex-1 h-full px-3 overflow-y-auto md:px-5 lg:px-10">
        <div className="flex-[1]">
          {/* Header */}
          <div className="flex items-center justify-between pt-6 pb-4">
            <div className="flex items-center gap-2">
              <SideBarMenu />
              <Breadcrumbs />
            </div>

            <HeaderChipsContainer />
          </div>

          {/* Body */}
          {children}
        </div>

        {/* Footer */}
        <Footer isMinimal className="mx-0 max-w-none py-12" />
      </main>
    </>
  );
}
