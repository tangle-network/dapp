import TxConfirmationModal from '@tangle-network/tangle-shared-ui/components/TxConfirmationModal';
import Sidebar from './Sidebar';
import { FC, PropsWithChildren, useEffect, useState } from 'react';
import TxHistoryNotifier from './TxHistoryNotifier';
import Header from './Header';
import { twMerge } from 'tailwind-merge';

type Props = {
  isSidebarInitiallyExpanded?: boolean;
};

const Layout: FC<PropsWithChildren<Props>> = ({
  children,
  isSidebarInitiallyExpanded,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (isSidebarInitiallyExpanded !== undefined) {
      return isSidebarInitiallyExpanded;
    }

    const storedValue = window.localStorage.getItem(
      'tangle-cloud-sidebar-expanded',
    );

    return storedValue === null ? true : storedValue === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    document.documentElement.setAttribute('data-sandbox-ui', '');
    document.documentElement.setAttribute(
      'data-sandbox-theme',
      theme === 'dark' ? 'tangle' : 'vault',
    );
    window.localStorage.setItem('tangle-cloud-theme', theme);
  }, [theme]);

  return (
    <div
      data-sandbox-ui
      data-sandbox-theme={theme === 'dark' ? 'tangle' : 'vault'}
      className="tangle-cloud-shell min-h-screen bg-tangle text-foreground"
    >
      <Sidebar
        isExpandedByDefault={isSidebarExpanded}
        onExpandedChange={setIsSidebarExpanded}
      />
      <Header
        theme={theme}
        onThemeChange={setTheme}
        className={isSidebarExpanded ? 'lg:left-64' : 'lg:left-16'}
      />

      <div
        className={twMerge(
          'min-h-screen pt-14 transition-[padding-left] duration-200',
          isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16',
        )}
      >
        <TxHistoryNotifier />
        <TxConfirmationModal />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
