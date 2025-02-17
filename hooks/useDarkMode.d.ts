type SupportTheme = 'light' | 'dark';
export type ToggleThemeModeFunc = (nextThemeMode?: SupportTheme | undefined) => void;
/**
 * Hook to get the current theme mode and a function to toggle the theme mode
 * @returns `[isDarkMode, toggleThemeMode]`
 */
export declare function useDarkMode(defaultTheme?: SupportTheme): [boolean, ToggleThemeModeFunc];
export {};
