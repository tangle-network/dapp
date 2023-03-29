import links from '@webb-tools/dapp-config/links';
import cx from 'classnames';

import { Button, Logo, Navbar } from '@webb-tools/webb-ui-components';
import { NavItemType } from '@webb-tools/webb-ui-components/components/Navbar/types';
import Link from 'next/link';
import { ComponentProps, useEffect, useState } from 'react';

const navItems: Array<NavItemType | { [label: string]: Array<NavItemType> }> = [
  // {
  //   protocols: [
  //     {
  //       label: 'Shielded Pool Protocols',
  //       url: '#',
  //     },
  //     {
  //       label: 'Shielded Identity Protocols',
  //       url: '#',
  //     },
  //   ],
  // },
  { label: 'community', url: '/community', isInternal: true },
  { label: 'docs', url: links.WEBB_DOCS_URL },
  { label: 'blog', url: '/blog', isInternal: true },
];

const buttonProps: Array<ComponentProps<typeof Button>> = [
  {
    href: links.BRIDGE_URL,
    target: '_blank',
    rel: 'noreferrer',
    children: 'Bridge',
    className: 'button-base button-primary',
  },
];

export const Header = () => {
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
      className={cx('fixed z-50 w-full bg-mono-0 min-h-[72px]', {
        'webb-shadow-sm': scrolled,
      })}
    >
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>

        <Navbar buttonProps={buttonProps} navItems={navItems} />
      </div>
    </header>
  );
};
