import LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import React, { type ComponentProps } from 'react';
import type { NotificationProvider, notificationApi } from '../components';
import type { ToggleThemeModeFunc } from '../hooks/useDarkMode';

export interface IWebbUIContext {
  theme: {
    isDarkMode: boolean;
    toggleThemeMode: ToggleThemeModeFunc;
  };

  customMainComponent: React.ReactElement | undefined;

  setMainComponent: (component: React.ReactElement | undefined) => void;

  notificationApi: typeof notificationApi;
  logger: LoggerService;
}

export type WebbUIProviderProps = {
  /**
   * If `true`, the `WebbUIProvider` will provide a error handler for inside components
   */
  hasErrorBoudary?: boolean;

  /**
   * Default theme mode
   * @default "dark"
   */
  defaultThemeMode?: 'dark' | 'light';

  /**
   * Notification options
   */
  notificationOptions?: Omit<
    ComponentProps<typeof NotificationProvider>,
    'children'
  >;

  children?: React.ReactNode;

  /**
   * Check if the provider is used in a Next.js app or not
   * @default false
   */
  isNextApp?: boolean;
};
