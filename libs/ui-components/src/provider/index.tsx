'use client';

import LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import { createElement, useCallback, useMemo, useState } from 'react';
import {
  NotificationProvider,
  notificationApi,
} from '../components/Notification';

import { UIErrorBoundary } from '../containers/UIErrorBoundary';
import {
  useNextDarkMode,
  useDarkMode as useNormalDarkMode,
} from '../hooks/useDarkMode';
import { IUIContext, UIProviderProps } from './types';
import UIContext from './UIContext';

const appLogger = LoggerService.new('Stats App');

export const UIProvider: React.FC<UIProviderProps> = ({
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

  const theme = useMemo<IUIContext['theme']>(
    () => ({
      isDarkMode,
      toggleThemeMode: toggleMode,
    }),
    [isDarkMode, toggleMode],
  );

  const UIEErrorBoundaryElement = useMemo(() => {
    return createElement(UIErrorBoundary, {
      logger: appLogger,
      children,
    });
  }, [children]);

  return (
    <UIContext.Provider
      value={{
        logger: appLogger,
        theme,
        customMainComponent,
        setMainComponent,
        notificationApi,
      }}
    >
      <NotificationProvider {...notificationOptions}>
        {hasErrorBoundary ? UIEErrorBoundaryElement : children}
      </NotificationProvider>
    </UIContext.Provider>
  );
};
