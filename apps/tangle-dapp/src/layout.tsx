import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import Suspense from '@webb-tools/webb-ui-components/components/Suspense';
import { getSidebarStateFromCookie } from '@webb-tools/webb-ui-components/next-utils';
import type React from 'react';
import { cookieToInitialState } from 'wagmi';

import { Layout } from '../containers';
import Providers from './providers';

// Set viewport theme color via meta tag
const themeColorMeta = document.createElement('meta');
themeColorMeta.name = 'theme-color';
const setThemeColor = () => {
  themeColorMeta.content = window.matchMedia('(prefers-color-scheme: dark)')
    .matches
    ? '#252836'
    : '#fff';
};
setThemeColor();
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', setThemeColor);
document.head.appendChild(themeColorMeta);

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initialState = cookieToInitialState(
    getWagmiConfig({ isSSR: false }),
    document.cookie,
  );

  const isSidebarInitiallyExpanded = getSidebarStateFromCookie();

  return (
    <Suspense>
      <Providers wagmiInitialState={initialState}>
        <Layout isSidebarInitiallyExpanded={isSidebarInitiallyExpanded}>
          {children}
        </Layout>
      </Providers>
    </Suspense>
  );
};

export default Layout;
