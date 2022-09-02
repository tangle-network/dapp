import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { Typography } from '@webb-dapp/webb-ui-components/typograhy';
import cx from 'classnames';
import React from 'react';

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
}

/**
 * Webb Avatar component
 *
 * Props:
 *
 * - `size`: Size of avatar - `md`: 24px, `lg`: 48px (default: `md`)
 * - `darkMode`: Control darkMode using `js`, leave it's empty to control dark mode using `css`
 * - `src`: Image source for avatar
 * - `alt`: Alternative text if source is unavailable
 * - `fallback`: Optional fallback text if source image is unavailable
 *
 * @example
 *
 * <Avatar alt="Webb Logo" src="webblogo.png" />
 */
export const Avatar: React.FC<AvatarProps> = (props) => {
  const { alt, darkMode, fallback, size = 'md', src } = props;

  const sizeClassName = size === 'md' ? 'w-6 h-6' : 'w-12 h-12';
  const borderColorClassName =
    typeof darkMode === 'boolean'
      ? darkMode
        ? 'border-mono-180'
        : 'border-mono-0'
      : 'border-mono-0 dark:border-mono-180';
  const backgroundClassName =
    typeof darkMode === 'boolean' ? (darkMode ? 'bg-mono-180' : 'bg-mono-0') : 'bg-mono-0 dark:bg-mono-180';
  const textColorClassName =
    typeof darkMode === 'boolean' ? (darkMode ? 'text-mono-0' : 'text-mono-180') : 'text-mono-180 dark:text-mono-0';

  return (
    <AvatarPrimitive.Root
      className={cx(
        'inline-flex items-center justify-center align-middle overflow-hidden rounded-full border-2 box-border',
        sizeClassName,
        borderColorClassName,
        backgroundClassName
      )}
    >
      <AvatarPrimitive.Image src={src} alt={alt} className='w-full h-full object-cover' />
      {fallback && (
        <AvatarPrimitive.Fallback className={cx('w-full h-full flex justify-center items-center', textColorClassName)}>
          <Typography variant='body4' component='span' className={cx(textColorClassName)}>
            {fallback}
          </Typography>
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  );
};
