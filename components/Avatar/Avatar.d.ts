import { AvatarProps } from './types';
/**
 * Avatar component
 *
 * Props:
 *
 * - `size`: Size of avatar - `md`: 24px, `lg`: 48px (default: `md`)
 * - `darkMode`: Control darkMode using `js`, leave it's empty to control dark mode using `css`
 * - `src`: Image source for avatar
 * - `alt`: Alternative text if source is unavailable
 * - `fallback`: Optional fallback text if source image is unavailable
 * - `className`: Outer class name
 * - `tooltip`: Tooltip text to display on hover
 *
 * @example
 *
 * <Avatar alt="Logo" src="logo.png" />
 */
export declare const Avatar: React.FC<AvatarProps>;
