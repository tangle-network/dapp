import { Footer, useDarkMode } from '@tangle-network/ui-components';
import {
  bottomLinks,
  TANGLE_AVAILABLE_SOCIALS,
  TANGLE_PRIVACY_POLICY_URL,
  TANGLE_SOCIAL_URLS_RECORD,
  TANGLE_TERMS_OF_SERVICE_URL,
} from '@tangle-network/ui-components/constants';
import TxConfirmationModal from '@tangle-network/tangle-shared-ui/components/TxConfirmationModal';
import Sidebar, { MobileSidebar } from './Sidebar';
import { FC, PropsWithChildren, useCallback, useEffect, useState } from 'react';
import TxHistoryNotifier from './TxHistoryNotifier';
import Header from './Header';
import { twMerge } from 'tailwind-merge';
import CommandPalette from './chrome/CommandPalette';
import PageMotion from './chrome/PageMotion';
import ShortcutsHelp from './chrome/ShortcutsHelp';
import { useKeyboardShortcuts } from './chrome/useKeyboardShortcuts';
import { TopNavSlotProvider } from './chrome/TopNavSlot';

type Props = {
  isSidebarInitiallyExpanded?: boolean;
};

const SOCIAL_LINK_OVERRIDES: Partial<
  Record<(typeof TANGLE_AVAILABLE_SOCIALS)[number], string>
> = TANGLE_SOCIAL_URLS_RECORD;

const BOTTOM_LINK_OVERRIDES: Partial<
  Record<(typeof bottomLinks)[number]['name'], string>
> = {
  'Terms of Service': TANGLE_TERMS_OF_SERVICE_URL,
  'Privacy Policy': TANGLE_PRIVACY_POLICY_URL,
};

const Layout: FC<PropsWithChildren<Props>> = ({
  children,
  isSidebarInitiallyExpanded,
}) => {
  const [isDarkMode] = useDarkMode('dark');
  const theme = isDarkMode ? 'dark' : 'light';
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
    <TopNavSlotProvider>
      <div
        data-sandbox-ui
        data-sandbox-theme={theme === 'dark' ? 'tangle' : 'vault'}
        className="tangle-cloud-shell flex h-screen bg-tangle text-foreground"
      >
        <Sidebar
          isExpandedByDefault={isSidebarExpanded}
          onExpandedChange={() => setIsSidebarExpanded((value) => !value)}
        />

        <div
          className={twMerge('h-full flex-1 overflow-y-auto scrollbar-hide')}
        >
          <TxHistoryNotifier />
          <TxConfirmationModal />
          <CommandPalette
            open={isPaletteOpen}
            onOpenChange={setIsPaletteOpen}
          />
          <ShortcutsHelp open={isHelpOpen} onOpenChange={setIsHelpOpen} />

          <div className="m-auto flex h-full max-w-[1448px] flex-col justify-between px-4 md:px-8 lg:px-10">
            <div className="flex grow flex-col space-y-5">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center space-x-4 lg:space-x-0">
                  <MobileSidebar />
                </div>

                <Header />
              </div>

              <main className="flex-1">
                <PageMotion>{children}</PageMotion>
              </main>
            </div>

            <Footer
              socialsLinkOverrides={SOCIAL_LINK_OVERRIDES}
              bottomLinkOverrides={BOTTOM_LINK_OVERRIDES}
              isMinimal
              className="py-8"
            />
          </div>
        </div>
      </div>
    </TopNavSlotProvider>
  );
};

export default Layout;
