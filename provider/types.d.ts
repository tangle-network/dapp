import { default as LoggerService } from '../../../browser-utils/src/logger/LoggerService';
import { ComponentProps } from '../../../../node_modules/react';
import { NotificationProvider, notificationApi } from '../components';
import { ToggleThemeModeFunc } from '../hooks/useDarkMode';
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
    notificationOptions?: Omit<ComponentProps<typeof NotificationProvider>, 'children'>;
    children?: React.ReactNode;
};
