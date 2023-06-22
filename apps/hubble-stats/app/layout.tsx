import Head from 'next/head';
import './global.css';

export const metadata = {
  title: 'Hubble Stats',
  description: 'Hubble Stats',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Head>
        <title>Welcome to Hubble Stats!</title>
      </Head>
      <body>{children}</body>
    </html>
  );
}
