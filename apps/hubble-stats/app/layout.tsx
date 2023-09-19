import '@webb-tools/webb-ui-components/tailwind.css';
import { Metadata } from 'next';

import { Layout } from '../containers';
import { NextThemeProvider } from './providers';

export const metadata: Metadata = {
  title: 'Hubble Stats',
  description: 'Welcome to Hubble Stats!',
  icons: {
    icon: '/favicon.png',
  },
};

// revalidate every 5 seconds
export const revalidate = 5;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen bg-cover bg-body dark:bg-body_dark">
        <NextThemeProvider>
          <Layout>{children}</Layout>
        </NextThemeProvider>
      </body>
    </html>
  );
}
