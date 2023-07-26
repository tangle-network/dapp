'use client';

import {
  WebbUIProvider,
  Footer,
  SideBar,
} from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';

import { Header } from '../components';
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
            <Header />
            {children}
            <Footer isMinimal className="max-w-none" />
          </main>
        </body>
      </WebbUIProvider>
    </html>
  );
}
