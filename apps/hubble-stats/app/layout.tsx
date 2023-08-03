import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import '@webb-tools/webb-ui-components/tailwind.css';
import { Metadata } from 'next';

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
        {/** TODO: Upgrade to Next.js 13.4.2 might resolve this issue */}
        [/** https://github.com/webb-tools/webb-dapp/issues/1228 */]
        {/* @ts-expect-error Server Component */}
        <Layout>{children}</Layout>
      </WebbUIProvider>
    </html>
  );
}
