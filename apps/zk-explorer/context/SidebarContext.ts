import assert from 'assert';
import { ReactNode, createContext, useContext } from 'react';

type SidebarContextType = {
  isSidebarOpen: boolean;
  sidebarContent: ReactNode;
  setSidebarOpen: (open: boolean) => void;
  updateSidebarContent: (content: ReactNode) => void;
};

export const SidebarContext = createContext<SidebarContextType | undefined>(
  undefined,
);

/**
 * Consuming the sidebar context allows you to open and
 * close the global sidebar component from anywhere.
 *
 * The sidebar context is provided by the `SidebarProvider`,
 * which should be present at the root of the application.
 *
 * @example
 * ```jsx
 * const { isSidebarOpen, setSidebarOpen, updateSidebarContent } = useSidebarContext();
 *
 * const prepareAndShowSidebar = () => {
 *   updateSidebarContent(<SidebarContentGoesHere />);
 *   setSidebarOpen(true);
 * }
 *
 * // ...
 *
 * prepareAndShowSidebar();
 * ```
 */
export const useSidebarContext = () => {
  const context = useContext(SidebarContext);

  assert(
    context !== undefined,
    'Sidebar context must be used within a sidebar provider (did you forget to wrap your app in the sidebar provider component?)',
  );

  return context;
};
