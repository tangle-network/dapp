import Link from 'next/link';
import { TangleLogo } from '@webb-tools/webb-ui-components';
import { Navbar } from '.';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-mono-0 min-h-[72px] webb-shadow-sm">
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Link href="/">
          <TangleLogo hideNameOnMobile />
        </Link>
        <Navbar />
      </div>
    </header>
  );
};
