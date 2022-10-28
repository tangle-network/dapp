import { LoggerService } from '@webb-tools/app-util';
import React, { createContext, useMemo } from 'react';

import { WebbUIErrorBoudary } from '../containers/WebbUIErrorBoudary';
import { useDarkMode } from '../hooks/useDarkMode';
import { IWebbUIContext, WebbUIProviderProps } from './types';

export const WebbUIContext = createContext<null | IWebbUIContext>(null);

const appLogger = LoggerService.new('Stats App');

export const WebbUIProvider: React.FC<WebbUIProviderProps> = ({
  children,
  hasErrorBoudary,
}) => {
  const [isDarkMode, toggleMode] = useDarkMode();

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
    <WebbUIContext.Provider value={{ theme }}>
      {hasErrorBoudary ? WebbUIEErrorBoundaryElement : children}
    </WebbUIContext.Provider>
  );
};
