import { createContext, useContext } from 'react';

type TabsContextType = {
  selectedTabIndex: number;
  setSelectedTabIndex: (index: number) => void;
};

export const TabsContext = createContext<TabsContextType>({
  selectedTabIndex: 0,
  setSelectedTabIndex: () => {
    //
  },
});

export const useTabs = () => useContext(TabsContext);
