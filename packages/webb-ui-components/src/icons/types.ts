/**
 * Base interface for Webb Icon
 */
export interface IconBase {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px)
   * @default "md"
   */
  size?: 'md' | 'lg';
  /**
   * Use the icon in dark mode, this prop control theme mode with `js`.
   * If it's empty, the theme mode will control by `css`
   */
  darkMode?: boolean;
}
