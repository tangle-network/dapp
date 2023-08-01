'use client';
import {
  WebbUIProvider,
  Footer,
  SideBar,
  Logo,
  LogoWithoutName,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { WEBB_MKT_URL } from '@webb-tools/webb-ui-components/constants';
import { Header } from '../components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { sideBarProps } from '../constants';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WebbUIProvider defaultThemeMode="light">
        <body className="h-screen bg-body dark:bg-body_dark bg-cover flex">
          <SideBar {...sideBarProps} className="hidden lg:block" />
          <main className="flex-1 px-3 md:px-5 lg:px-10 overflow-y-auto">
            <Header tvlValue="$13,642,124" volumeValue="$8,562,122" />
            {children}
            <Footer isMinimal className="max-w-none" />
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
