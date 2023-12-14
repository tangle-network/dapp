import type { Metadata, Viewport } from 'next';

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
  description: 'Welcome to ZK Explorer!',
  metadataBase: process.env.URL ? new URL(process.env.URL) : null,
  twitter: {
    card: 'summary_large_image',
    title: 'ZK Explorer',
    description: 'Welcome to ZK Explorer!',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
