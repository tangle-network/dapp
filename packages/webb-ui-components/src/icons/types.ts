/**
 * Base interface for Webb Icon
 */
export interface IconBase {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  size?: 'md' | 'lg' | 'xl';
  /**
   * Use the icon in dark mode, this prop control theme mode with `js`.
   * If it's empty, the theme mode will control by `css`
   */
  darkMode?: boolean;
  /**
   * Class name for svg props
   */
  className?: string;
}
