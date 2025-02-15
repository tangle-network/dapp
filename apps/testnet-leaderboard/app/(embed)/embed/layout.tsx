import '@tangle-network/ui-components/tailwind.css';

import Providers from '../../(default)/providers';

export const metadata = {
  title: 'Leaderboard',
  description: 'Leaderboard',
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
      </body>
    </html>
  );
}
