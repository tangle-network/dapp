import { TangleLogo } from '@webb-tools/webb-ui-components';
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
          'sticky flex flex-col top-0 z-50 bg-mono-0 min-h-[72px] webb-shadow-sm',
          className
        )}
        ref={ref}
      >
        <div className="w-full max-w-[1440px] mx-auto px-[20px] lg:px-0 py-4 lg:order-1">
          <div className="lg:px-[11.25%] flex items-center justify-between">
            <Link href="/">
              <TangleLogo />
            </Link>
            <Navbar />
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;
