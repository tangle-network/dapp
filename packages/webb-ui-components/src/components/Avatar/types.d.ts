import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * Props for `Avatar` component
 */
export interface AvatarProps extends WebbComponentBase {
  /**
   * Size of avatar, `md`: 24px, `lg`: 48px (default: "md")
   */
  size?: 'md' | 'lg';
  /**
   * Source for avatar
   */
  src: string;
  /**
   * Alternative text if source is unavailable
   */
  alt: string;
  /**
   * Fallback if source image is unavailable
   */
  fallback?: string;
}
