import vAnchorClient from '@webb-tools/vanchor-client';
import { Footer } from '@webb-tools/webb-ui-components';
import React from 'react';

import { OverviewChipsContainer } from '..';
import { Breadcrumbs, SideBar, SideBarMenu } from '../../components';
import { formatEther } from 'viem';

const Layout = async ({ children }: { children?: React.ReactNode }) => {
  const { totalValueLocked } =
    await vAnchorClient.TotalValueLocked.GetVAnchorTotalValueLockedByChain(
      vAnchorClient.SubgraphUrl.vAnchorOrbitAthena,
      '0x4b88368Eb14D7d09f0ca737832cEBfb8F12e3f05'
    );

  console.log('Fetched data from vAnchor subgraph: ', totalValueLocked);

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
