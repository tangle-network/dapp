import { TANGLE_MKT_URL } from '@webb-tools/webb-ui-components/constants';
import Image from 'next/image';
import Link from 'next/link';
import { ComponentProps, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Navbar } from './Navbar';

const Header = forwardRef<ElementRef<'header'>, ComponentProps<'header'>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        {...props}
        className={twMerge(
          'relative z-[1000] top-0 bg-mono-0 min-h-[88px] webb-shadow-sm px-[5%] py-6',
          className
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between w-full mx-auto max-w-7xl">
          <Link href={TANGLE_MKT_URL}>
            <Image
              src="https://assets-global.website-files.com/6494562b44a28080aafcbad4/6494599436915879aa403230_Tangle%20Logo.png"
              alt="Tangle Logo"
              priority
              width={124}
              height={54}
            />
          </Link>

          <Navbar />
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
