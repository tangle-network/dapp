import { DynamicSVGImportOptions } from '../hooks';

type SVGBase = Omit<React.SVGProps<SVGSVGElement>, 'path' | 'd'>;

export type IconSize = 'md' | 'lg' | 'xl';

/**
 * Base interface for Webb Icon
 */
export interface IconBase extends SVGBase {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  size?: IconSize;
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

/**
 * Base interface for Web Token Icon
 */
export interface TokenIconBase extends Omit<IconBase, 'darkMode'>, DynamicSVGImportOptions {
  /**
   * The symbol for the cryptocurrency to get the icon
   */
  name: string;
}
