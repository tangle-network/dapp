import Link from 'next/link';
import { TangleLogo } from '@webb-tools/webb-ui-components';
import { Navbar } from '.';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-mono-0 min-h-[72px] webb-shadow-sm">
      <div className="lg:w-[77.5%] mx-auto px-5 py-4 lg:px-0 flex items-center justify-between">
        <Link href="/">
          <TangleLogo hideNameOnMobile />
        </Link>
        <Navbar />
      </div>
    </header>
  );
};
