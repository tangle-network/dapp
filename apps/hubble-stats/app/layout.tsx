import { Metadata } from 'next';
import { WebbUIProvider, Footer } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';

import { Header, SideBar } from '../components';

export const metadata: Metadata = {
  title: 'Hubble Stats',
  description: 'Welcome to Hubble Stats!',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <WebbUIProvider defaultThemeMode="light">
        <body className="h-screen bg-body dark:bg-body_dark bg-cover flex">
          <SideBar />
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
