import TxConfirmationModal from '@tangle-network/tangle-shared-ui/components/TxConfirmationModal';
import Sidebar from './Sidebar';
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import TxHistoryNotifier from './TxHistoryNotifier';
import Header from './Header';
import { twMerge } from 'tailwind-merge';
import CommandPalette from './chrome/CommandPalette';
import PageMotion from './chrome/PageMotion';
import ShortcutsHelp from './chrome/ShortcutsHelp';
import { useKeyboardShortcuts } from './chrome/useKeyboardShortcuts';

type Props = {
  isSidebarInitiallyExpanded?: boolean;
};

const Layout: FC<PropsWithChildren<Props>> = ({
  children,
  isSidebarInitiallyExpanded,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const storedTheme = window.localStorage.getItem('tangle-cloud-theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }

    return 'dark';
  });
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

  // Publish the current sidebar width as a CSS variable on the root element so
  // Radix-portaled dialogs (rendered to `<body>`, outside the layout shell) can
  // offset their viewport-centered position by half the sidebar to land
  // visually centered in the content area. See `.tangle-wallet-modal` rule in
  // styles.css. Without this, the wallet modal sits left of center because
  // viewport center is left of content-area center.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--cloud-sidebar-width',
      isSidebarExpanded ? '16rem' : '4rem',
    );
  }, [isSidebarExpanded]);

  // Global ⌘K palette + ? help overlay + g-prefix navigation. Mounted once
  // at the layout root so every page inherits the keyboard surface.
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  useKeyboardShortcuts({
    onOpenPalette: useCallback(() => setIsPaletteOpen(true), []),
    onOpenHelp: useCallback(() => setIsHelpOpen(true), []),
  });

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
        <CommandPalette open={isPaletteOpen} onOpenChange={setIsPaletteOpen} />
        <ShortcutsHelp open={isHelpOpen} onOpenChange={setIsHelpOpen} />

        <main className="flex-1">
          <PageMotion>{children}</PageMotion>
        </main>
      </div>
    </div>
  );
};

export default Layout;
