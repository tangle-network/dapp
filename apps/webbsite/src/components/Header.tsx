import { Logo } from '@webb-tools/webb-ui-components/components/Logo/Logo';

import Navbar from './Navbar';

const Header = () => {
  return (
    <header className="fixed z-50 w-full bg-mono-0">
      <div className="max-w-[1200px] mx-auto p-4 flex items-center justify-between">
        <Logo />

        <Navbar />
      </div>
    </header>
  );
};

export default Header;
