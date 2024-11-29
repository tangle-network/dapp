import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SIDEBAR_OPEN_KEY } from '../constants';

interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      setOpen: (open: boolean) => set({ isOpen: open }),
    }),
    {
      name: SIDEBAR_OPEN_KEY,
    },
  ),
);

// Optional: Export these for backwards compatibility
export const setSidebarCookieOnToggle = () => {
  useSidebarStore.getState().toggle();
};

export const getSidebarStateFromCookie = () => {
  return useSidebarStore.getState().isOpen;
};
