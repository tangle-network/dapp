import Link from 'next/link';
import { TangleLogo } from '@webb-tools/webb-ui-components';
import { Navbar } from '.';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-mono-0 min-h-[72px] webb-shadow-sm">
      <div className="max-w-[1440px] mx-auto px-[20px] lg:px-0 py-4">
        <div className="lg:px-[11.25%] flex items-center justify-between">
          <Link href="/">
            <TangleLogo hideNameOnMobile />
          </Link>
          <Navbar />
        </div>
      </div>
    </header>
  );
};
