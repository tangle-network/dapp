import React from 'react';
import { Footer } from '@webb-tools/webb-ui-components';

import { OverviewChipsContainer } from '..';
import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';

const Layout = async ({ children }: { children?: React.ReactNode }) => {
  return (
    <body className="flex h-screen bg-cover bg-body dark:bg-body_dark">
      <SideBar />
      <main className="flex-1 px-3 overflow-y-auto md:px-5 lg:px-10">
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

        {/* Footer */}
        <Footer isMinimal className="max-w-none" />
      </main>
    </body>
  );
};

export default Layout;
