import { DynamicSVGImportOptions } from '../hooks';
import { WebbComponentBase } from '../types';

type SVGBase = Omit<React.SVGProps<SVGSVGElement>, 'path' | 'd'>;

export type IconSize = 'md' | 'lg' | 'xl';

/**
 * Base interface for Webb Icon
 */
export interface IconBase extends SVGBase, WebbComponentBase {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  size?: IconSize;
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
