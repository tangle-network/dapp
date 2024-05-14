'use client';

import { noop } from '@tanstack/react-table';
import { LoggerService } from '@webb-tools/app-util';
import React, { createContext, useCallback, useMemo, useState } from 'react';
import {
  NotificationProvider,
  notificationApi,
} from '../components/Notification/index.js';

import { WebbUIErrorBoudary } from '../containers/WebbUIErrorBoudary/index.js';
import {
  useDarkMode as useNormalDarkMode,
  useNextDarkMode,
} from '../hooks/useDarkMode.js';
import { IWebbUIContext, WebbUIProviderProps } from './types.js';

const initialContext: IWebbUIContext = {
  customMainComponent: undefined,
  notificationApi,
  setMainComponent: noop,
  logger: LoggerService.get('app'),
  theme: {
    isDarkMode: true,
    toggleThemeMode: noop,
  },
};

export const WebbUIContext = createContext<IWebbUIContext>(initialContext);

const appLogger = LoggerService.new('Stats App');

export const WebbUIProvider: React.FC<WebbUIProviderProps> = ({
  children,
  defaultThemeMode = 'dark',
  hasErrorBoudary,
  notificationOptions,
  isNextApp = false,
}) => {
  const useDarkMode = useMemo(
    () => (isNextApp ? useNextDarkMode : useNormalDarkMode),
    [isNextApp]
  );

  const [isDarkMode, toggleMode] = useDarkMode(defaultThemeMode);

  // The CustomMainComponent is a component that should be renderable inside of Pages -
  // But the contents of the component are defined outside of the Page.
  // This state exists to pass as props into the page.
  const [customMainComponent, setCustomMainComponent] = useState<
    React.ReactElement | undefined
  >(undefined);

  const setMainComponent = useCallback(
    (component: React.ReactElement | undefined) => {
      setCustomMainComponent(component);
    },
    [setCustomMainComponent]
  );

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
    <WebbUIContext.Provider
      value={{
        logger: appLogger,
        theme,
        customMainComponent,
        setMainComponent,
        notificationApi,
      }}
    >
      <NotificationProvider {...notificationOptions}>
        {hasErrorBoudary ? WebbUIEErrorBoundaryElement : children}
      </NotificationProvider>
    </WebbUIContext.Provider>
  );
};
