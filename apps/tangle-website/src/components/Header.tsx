import Link from 'next/link';
import { Navbar, TangleLogo } from '.';

export const Header = () => {

  return (
    <header className="fixed z-50 w-full bg-mono-0 min-h-[72px] webb-shadow-sm">
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Link href="/">
          <TangleLogo />
        </Link>
        <Navbar />
      </div>
    </header>
  );
};
