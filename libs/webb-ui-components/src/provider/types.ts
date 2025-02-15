import LoggerService from '@webb-tools/browser-utils/logger/LoggerService';
import { type ComponentProps } from 'react';
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
};
