import vAnchorClient from '@webb-tools/vanchor-client';
import { Footer } from '@webb-tools/webb-ui-components';
import React from 'react';

import { OverviewChipsContainer } from '..';
import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';

const Layout = async ({ children }: { children?: React.ReactNode }) => {
  const tvl =
    await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChain(
      vAnchorClient.SubgraphUrl.vAnchorOrbitAthena,
      '0xDa68464c391Da8ff60b40273F2Ef0a9971694F99'
    );

  console.log('TVL', tvl.totalValueLocked);

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
