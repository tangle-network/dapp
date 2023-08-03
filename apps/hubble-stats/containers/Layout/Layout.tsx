import { FC } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';

import { OverviewChipsContainer } from '..';
import { SideBar, SideBarMenu, Breadcrumbs } from '../../components';

const Layout: FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <body className="h-screen bg-body dark:bg-body_dark bg-cover flex">
      <SideBar />
      <main className="flex-1 px-3 md:px-5 lg:px-10 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pt-6 pb-4">
          <div className="flex gap-2 items-center">
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
