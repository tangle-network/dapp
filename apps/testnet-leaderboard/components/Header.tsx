import { TANGLE_MKT_URL } from '@tangle-network/ui-components/constants';
import { ComponentProps, ElementRef, forwardRef } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { Navbar } from './Navbar';

const Header = forwardRef<ElementRef<'header'>, ComponentProps<'header'>>(
  ({ className, ...props }, ref) => {
    return (
      <header
        {...props}
        className={twMerge(
          'relative z-[1000] top-0 bg-mono-0 min-h-[88px] shadow-sm px-[5%] py-6',
          className,
        )}
        ref={ref}
      >
        <div className="flex items-center justify-between w-full mx-auto max-w-7xl">
          <Link to={TANGLE_MKT_URL}>
            <img
              src="https://assets-global.website-files.com/6494562b44a28080aafcbad4/6494599436915879aa403230_Tangle%20Logo.png"
              alt="Tangle Logo"
              width={124}
              height={54}
            />
          </Link>

          <Navbar />
        </div>
      </header>
    );
  },
);

Header.displayName = 'Header';

export default Header;
