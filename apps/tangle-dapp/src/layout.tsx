import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import Suspense from '@webb-tools/webb-ui-components/components/Suspense';
import { cookieToInitialState } from 'wagmi';
import { FC, ReactNode, useEffect } from 'react';

import { Layout as LayoutContainer } from '../containers';
import Providers from './providers';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  useEffect(() => {
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
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', setThemeColor);
    document.head.appendChild(themeColorMeta);

    return () => {
      mediaQuery.removeEventListener('change', setThemeColor);
      document.head.removeChild(themeColorMeta);
    };
  }, []);

  const initialState = cookieToInitialState(
    getWagmiConfig({ isSSR: false }),
    document.cookie,
  );

  // Get sidebar state from localStorage instead of cookies
  const isSidebarInitiallyExpanded =
    localStorage.getItem('sidebarExpanded') === 'true';

  return (
    <Suspense>
      <Providers wagmiInitialState={initialState}>
        <LayoutContainer
          isSidebarInitiallyExpanded={isSidebarInitiallyExpanded}
        >
          {children}
        </LayoutContainer>
      </Providers>
    </Suspense>
  );
};

export default Layout;
