'use client';

import LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import { createElement, useCallback, useMemo, useState } from 'react';
import {
  NotificationProvider,
  notificationApi,
} from '../components/Notification';

import { WebbUIErrorBoundary } from '../containers/WebbUIErrorBoundary';
import {
  useNextDarkMode,
  useDarkMode as useNormalDarkMode,
} from '../hooks/useDarkMode';
import { IWebbUIContext, WebbUIProviderProps } from './types';
import WebbUIContext from './WebbUIContext';

const appLogger = LoggerService.new('Stats App');

export const WebbUIProvider: React.FC<WebbUIProviderProps> = ({
  children,
  defaultThemeMode = 'dark',
  hasErrorBoundary,
  notificationOptions,
  isNextApp = false,
}) => {
  const useDarkMode = useMemo(
    () => (isNextApp ? useNextDarkMode : useNormalDarkMode),
    [isNextApp],
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
    [setCustomMainComponent],
  );

  const theme = useMemo<IWebbUIContext['theme']>(
    () => ({
      isDarkMode,
      toggleThemeMode: toggleMode,
    }),
    [isDarkMode, toggleMode],
  );

  const WebbUIEErrorBoundaryElement = useMemo(() => {
    return createElement(WebbUIErrorBoundary, {
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
        {hasErrorBoundary ? WebbUIEErrorBoundaryElement : children}
      </NotificationProvider>
    </WebbUIContext.Provider>
  );
};
