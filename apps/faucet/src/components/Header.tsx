import links from '@webb-tools/dapp-config/links';
import cx from 'classnames';

import { Button, Logo, Navbar } from '@webb-tools/webb-ui-components';
import { NavItemType } from '@webb-tools/webb-ui-components/components/Navbar/types';
import Link from 'next/link';
import { ComponentProps, useEffect, useState } from 'react';

const navItems: Array<NavItemType | { [label: string]: Array<NavItemType> }> = [
  { label: 'community', url: 'https://webb.tools/community' },
  { label: 'docs', url: links.WEBB_DOCS_URL },
  { label: 'tangle network', url: links.TANGLE_NETWORK_URL },
];

const buttonProps: Array<ComponentProps<typeof Button>> = [
  {
    href: links.BRIDGE_URL,
    target: '_blank',
    rel: 'noreferrer',
    children: 'Huddle Bridge',
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
      className={cx('fixed top-0 z-50 w-full bg-mono-0', {
        'webb-shadow-sm': scrolled,
      })}
    >
      <div className="max-w-[1160px] flex items-center justify-between min-h-[72px] mx-auto">
        <Link href="/">
          <Logo />
        </Link>

        <Navbar buttonProps={buttonProps} navItems={navItems} />
      </div>
    </header>
  );
};

export default Header;
