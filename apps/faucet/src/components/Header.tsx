import {
  Button,
  Logo,
  Navbar,
  Typography,
} from '@webb-tools/webb-ui-components';
import { NavItemType } from '@webb-tools/webb-ui-components/components/Navbar/types';
import {
  BRIDGE_URL,
  TANGLE_MKT_URL,
  WEBB_DOCS_URL,
  WEBB_MKT_URL,
} from '@webb-tools/webb-ui-components/constants';
import cx from 'classnames';
import Link from 'next/link';
import { ComponentProps, useEffect, useState } from 'react';

const navItems: Array<NavItemType | { [label: string]: Array<NavItemType> }> = [
  { label: 'community', url: new URL('community', WEBB_MKT_URL).toString() },
  { label: 'docs', url: WEBB_DOCS_URL },
  { label: 'tangle network', url: TANGLE_MKT_URL },
];

const buttonProps: Array<ComponentProps<typeof Button>> = [
  {
    children: 'Hubble Bridge',
    href: BRIDGE_URL,
    rel: 'noreferrer',
    target: '_blank',
  },
];

const Header = () => {
  // State for tracking whether the user has scrolled down the page
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    // Listen for scroll events
    window.addEventListener('scroll', handleScroll);

    handleScroll();

    return () => {
      // Clean up the event listener
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header
      className={cx('fixed top-0 z-10 w-full bg-mono-0 px-2', {
        'webb-shadow-sm': scrolled,
      })}
    >
      <div className="max-w-[1160px] flex items-center justify-between min-h-[72px] mx-auto">
        <Link className="flex items-center gap-2" href="/">
          <Logo />

          <Typography variant="mkt-body2" fw="medium">
            {'| Faucet'}
          </Typography>
        </Link>

        <Navbar buttonProps={buttonProps} navItems={navItems} />
      </div>
    </header>
  );
};

export default Header;
