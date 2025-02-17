import '@tangle-network/ui-components/tailwind.css';

import Footer from '../../components/Footer';
import Header from '../../components/Header';
import Providers from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="box-border h-full p-0 m-0">
      <body className="box-border h-full p-0 m-0">
        <div className="min-h-full grid grid-rows-[auto_1fr_auto]">
          <Header className="grow-0 shrink-0" />

          <Providers>
            <main className="grow-1">{children}</main>
          </Providers>

          <Footer className="grow-0 shrink-0" />
        </div>
      </body>
    </html>
  );
}
