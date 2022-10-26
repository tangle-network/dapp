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

  darkMode?: boolean;
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
