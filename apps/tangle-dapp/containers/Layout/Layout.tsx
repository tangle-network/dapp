import React, { type PropsWithChildren, type FC } from 'react';
import { Footer } from '@webb-tools/webb-ui-components';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <main className="flex flex-col justify-between flex-1 h-full px-3 overflow-y-auto md:px-5 lg:px-10">
        <div className="flex-[1]">
          {/* Header */}
          <div className="flex items-center justify-between pt-6 pb-4">
            <div className="flex items-center gap-2">
              {/* Sidebar */}
              <div></div>
            </div>
          </div>

          {/* Body */}
          {children}
        </div>

        {/* Footer */}
        <Footer isMinimal className="mx-0 max-w-none py-12" />
      </main>
    </>
  );
};

export default Layout;
