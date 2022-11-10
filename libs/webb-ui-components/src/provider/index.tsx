import { LoggerService } from '@webb-tools/app-util';
import React, { createContext, useMemo, useState } from 'react';

import { WebbUIErrorBoudary } from '../containers/WebbUIErrorBoudary';
import { useDarkMode } from '../hooks/useDarkMode';
import { IWebbUIContext, WebbUIProviderProps } from './types';

export const WebbUIContext = createContext<IWebbUIContext>({
  customMainComponent: undefined,
  setMainComponent(component) {
    console.log('default setMainComponent');
  },
  theme: {
    isDarkMode: true,
    toggleThemeMode: () => {
      console.log('default toggleThemeMode');
    }
  }
});

const appLogger = LoggerService.new('Stats App');

export const WebbUIProvider: React.FC<WebbUIProviderProps> = ({
  children,
  hasErrorBoudary,
}) => {
  const [isDarkMode, toggleMode] = useDarkMode();

  // The CustomMainComponent is a component that should be renderable inside of Pages - 
  // But the contents of the component are defined outside of the Page.
  // This state exists to pass as props into the page.
  const [customMainComponent, setCustomMainComponent] = useState<React.ReactElement | undefined>(undefined);
  const setMainComponent = (component: React.ReactElement | undefined) => {
    setCustomMainComponent(component)
  };

  const theme = useMemo<IWebbUIContext['theme']>(
    () => ({
      isDarkMode,
      toggleThemeMode: toggleMode,
    }),
    [isDarkMode, toggleMode]
  );

  const WebbUIEErrorBoundaryElement = useMemo(() => {
    return React.createElement(WebbUIErrorBoudary, {
      logger: appLogger,
      children,
    });
  }, [children]);

  return (
    <WebbUIContext.Provider value={{ theme, customMainComponent, setMainComponent }}>
      {hasErrorBoudary ? WebbUIEErrorBoundaryElement : children}
    </WebbUIContext.Provider>
  );
};
