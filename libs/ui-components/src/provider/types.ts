import LoggerService from '@tangle-network/browser-utils/logger/LoggerService';
import { type ComponentProps } from 'react';
import type { NotificationProvider, notificationApi } from '../components';
import type { ToggleThemeModeFunc } from '../hooks/useDarkMode';

export interface IUIContext {
  theme: {
    isDarkMode: boolean;
    toggleThemeMode: ToggleThemeModeFunc;
  };

  customMainComponent: React.ReactElement | undefined;

  setMainComponent: (component: React.ReactElement | undefined) => void;

  notificationApi: typeof notificationApi;
  logger: LoggerService;
}

export type UIProviderProps = {
  /**
   * If `true`, the `UIProvider` will provide a error handler for inside components
   */
  hasErrorBoundary?: boolean;

  /**
   * @default "dark"
   */
  defaultThemeMode?: 'dark' | 'light';

  notificationOptions?: Omit<
    ComponentProps<typeof NotificationProvider>,
    'children'
  >;

  children?: React.ReactNode;

  /**
   * Check if the provider is used in a Next.js app or not.
   * @default false
   */
  isNextApp?: boolean;
};
