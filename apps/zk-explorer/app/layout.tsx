import '@webb-tools/webb-ui-components/tailwind.css';
import '../styles/globals.css';

import { Footer } from '@webb-tools/webb-ui-components';
import type { Metadata, Viewport } from 'next';
import { METADATA_SITE_DESCRIPTION } from '../constants';
import { EnvVariableKey, requireEnvVariable } from '../utils';
import Providers from './providers';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff' },
    { media: '(prefers-color-scheme: dark)', color: '#252836' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: 'ZK Explorer',
    template: 'ZK Explorer | %s',
  },
  description: METADATA_SITE_DESCRIPTION,
  metadataBase: new URL(requireEnvVariable(EnvVariableKey.MetadataBaseUrl)),
  twitter: {
    card: 'summary_large_image',
    title: 'ZK Explorer',
    description: METADATA_SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Figure out what is injecting 'className="dark"' and 'style="colorScheme: 'dark"' to the html element, since it is producing a hydration error on the console. Might be coming from Webb UI library's theming-related logic.
  return (
    <html lang="en">
      <body className="bg-body relative">
        <Providers>
          <div className="max-w-[1240px] mx-auto flex flex-col h-full min-h-screen px-4">
            {children}

            <Footer isNext isMinimal className="w-full py-12 mt-auto" />
          </div>
        </Providers>
      </body>
    </html>
  );
}
