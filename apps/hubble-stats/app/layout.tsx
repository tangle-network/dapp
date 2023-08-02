import { Metadata } from 'next';
import { WebbUIProvider, Footer } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';

import { Layout } from '../containers';

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
        <Layout>{children}</Layout>
      </WebbUIProvider>
    </html>
  );
}
