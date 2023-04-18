import Link from 'next/link';
import { TangleLogo } from '@webb-tools/webb-ui-components';
import { Navbar } from '.';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-mono-0 min-h-[72px] webb-shadow-sm block max-w-[1440px] mx-auto px-[20px] md:px-[24px] lg:px-[156.5px]">
      <div className="py-4 flex items-center justify-between">
        <Link href="/">
          <TangleLogo hideNameOnMobile />
        </Link>
        <Navbar />
      </div>
    </header>
  );
};
