import React, { Suspense, type FC, type PropsWithChildren } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';

import { OverviewChipsContainer } from '..';
import {
  Breadcrumbs,
  SideBar,
  SideBarMenu,
  LoadingScreen,
} from '../../components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <SideBar />
      <Suspense fallback={<LoadingScreen />}>
        <main className="flex flex-col justify-between flex-1 px-3 overflow-y-auto md:px-5 lg:px-10">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pt-6 pb-4">
              <div className="flex items-center gap-2">
                <SideBarMenu />
                <Breadcrumbs />
              </div>
              {/* TypeScript doesn't understand async components. */}
              {/* Current approach: https://github.com/vercel/next.js/issues/42292#issuecomment-1298459024 */}
              {/* @ts-expect-error Server Component */}
              <OverviewChipsContainer />
            </div>

            {/* Body */}
            {children}
          </div>
          <div className="flex-grow" />
          {/* Footer */}
          <Footer isMinimal className="mx-0 max-w-none" />
        </main>
      </Suspense>
    </>
  );
};

export default Layout;
