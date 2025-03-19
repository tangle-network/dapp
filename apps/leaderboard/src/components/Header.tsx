import { TangleLogo } from '@tangle-network/ui-components';
import { TANGLE_MKT_URL } from '@tangle-network/ui-components/constants';
import { ComponentProps, ElementRef, forwardRef } from 'react';
import { Link } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { Navbar } from './Navbar';

const Header = forwardRef<ElementRef<'header'>, ComponentProps<'header'>>(
  ({ className, ...props }, ref) => {
    return (
      <header {...props} className={twMerge('py-6', className)} ref={ref}>
        <div className="flex items-center justify-between">
          <Link to={TANGLE_MKT_URL}>
            <TangleLogo />
          </Link>

          <Navbar />
        </div>
      </header>
    );
  },
);

Header.displayName = 'Header';

export default Header;
