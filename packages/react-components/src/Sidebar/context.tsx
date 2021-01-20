import { createContext, Dispatch, SetStateAction } from 'react';

export const SidebarActiveContext = createContext<{
  active?: HTMLElement | null;
  setActive?: Dispatch<SetStateAction<HTMLElement | null>>;
}>({});
