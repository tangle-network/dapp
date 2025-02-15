import '@tangle-network/ui-components/tailwind.css';

import Script from 'next/script';

import Providers from '../../(default)/providers';

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="box-border h-full p-0 m-0 bg-transparent">
      <body className="box-border h-full p-0 m-0 bg-transparent">
        <Providers>{children}</Providers>

        <Script
          defer
          data-domain="leaderboard.tangle.tools"
          src="https://plausible.io/js/script.js"
        />
      </body>
    </html>
  );
}
