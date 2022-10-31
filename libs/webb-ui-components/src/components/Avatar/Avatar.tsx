import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { Typography } from '../../typography';
import cx from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import Identicon from '@polkadot/react-identicon';

import { AvatarProps } from './types';
import { getAvatarSizeInPx } from './utils';

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
 * - `className`: Outer class name
 *
 * @example
 *
 * <Avatar alt="Webb Logo" src="webblogo.png" />
 */
export const Avatar: React.FC<AvatarProps> = (props) => {
  const {
    alt,
    className: outerClassName,
    darkMode,
    fallback,
    size = 'md',
    sourceVariant = 'address',
    src,
    theme = 'polkadot',
    value: valueProp,
  } = props;

  const sizeClassName = useMemo(() => (size === 'md' ? 'w-6 h-6' : 'w-12 h-12'), [size]);

  const classNames = useMemo(() => {
    const borderColor =
      typeof darkMode === 'boolean'
        ? darkMode
          ? ('border-mono-180' as const)
          : ('border-mono-0' as const)
        : ('border-mono-0 dark:border-mono-180' as const);

    const bg =
      typeof darkMode === 'boolean'
        ? darkMode
          ? ('bg-mono-180' as const)
          : ('bg-mono-0' as const)
        : ('bg-mono-0 dark:bg-mono-180' as const);

    const text =
      typeof darkMode === 'boolean'
        ? darkMode
          ? ('text-mono-0' as const)
          : ('text-mono-180' as const)
        : ('text-mono-180 dark:text-mono-0' as const);

    return {
      borderColor,
      bg,
      text,
    };
  }, [darkMode]);

  const typoVariant = useMemo(() => (size === 'md' ? 'body4' : 'body1'), [size]);

  const valueAddress = useMemo(() => (sourceVariant === 'address' ? valueProp : undefined), [valueProp, sourceVariant]);

  useEffect(() => {
    if (!valueProp && !src) {
      throw new Error('Must provide `src` or `value` for Avatar component');
    }
  }, [src, valueProp]);

  return (
    <AvatarPrimitive.Root
      className={twMerge(
        'inline-flex items-center justify-center align-middle overflow-hidden rounded-full border box-border',
        sizeClassName,
        classNames.borderColor,
        classNames.bg,
        outerClassName
      )}
    >
      {valueAddress && <Identicon size={getAvatarSizeInPx(size)} value={valueAddress} theme={theme} />}

      {!valueAddress && (
        <>
          <AvatarPrimitive.Image src={src} alt={alt} className='object-cover w-full h-full' />
          {fallback && (
            <AvatarPrimitive.Fallback className={cx('w-full h-full flex justify-center items-center', classNames.text)}>
              <Typography variant={typoVariant} fw='semibold' component='span' className={classNames.text}>
                {fallback.substring(0, 2)}
              </Typography>
            </AvatarPrimitive.Fallback>
          )}
        </>
      )}
    </AvatarPrimitive.Root>
  );
};
