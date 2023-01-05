import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';
import cx from 'classnames';

import { useEffect, useState } from 'react';
import Navbar from './Navbar';
// webb-shadow-sm
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
      className={cx('fixed z-50 w-full bg-mono-0', {
        'webb-shadow-sm': scrolled,
      })}
    >
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Logo />

        <Navbar />
      </div>
    </header>
  );
};

export default Header;
