'use client';

import { ReactNode, useCallback, useState } from 'react';
import { OverlayMask } from '../components/OverlayMask';
import { SidebarContext } from './SidebarContext';

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const setOpen = useCallback((open: boolean): void => {
    setIsOpen(open);
  }, []);

  const updateContent = useCallback((newContent: ReactNode) => {
    setContent(newContent);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarOpen: isOpen,
        setSidebarOpen: setOpen,
        sidebarContent: content,
        updateSidebarContent: updateContent,
      }}
    >
      {/* Global sidebar component */}
      {isOpen && (
        <>
          <OverlayMask
            onClick={() => setOpen(false)}
            doPreventBodyScrolling
            isPrevalent
            opacity={0.6}
          />

          <div
            style={{ maxWidth: 'min(80%, 344px)' }}
            className="fixed top-0 right-0 bg-mono-0 dark:bg-mono-190 z-20 px-9 py-6 w-full min-w-[220px] h-screen overflow-y-auto"
          >
            {content}
          </div>
        </>
      )}

      {children}
    </SidebarContext.Provider>
  );
};
