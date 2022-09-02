/**
 * Props for `Avatar` component
 */
export interface AvatarProps {
  /**
   * Size of avatar, `md`: 24px, `lg`: 48px (default: "md")
   */
  size?: 'md' | 'lg';
  /**
   * Control darkMode using `js`, leave it's empty to control dark mode using `css`
   */
  darkMode?: boolean;
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
  /**
   * Outer class name
   */
  className?: string;
}
