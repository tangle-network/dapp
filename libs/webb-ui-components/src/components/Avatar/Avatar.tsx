import React, { useEffect, useMemo } from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import cx from 'classnames';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Identicon } from './Identicon';
import { AvatarProps } from './types';
import { getAvatarSizeInPx, getAvatarClassNames } from './utils';

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

  const sizeClassName = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  }, [size]);

  const classNames = useMemo(() => {
    return getAvatarClassNames(darkMode);
  }, [darkMode]);

  const typoVariant = useMemo(
    () => (size === 'md' ? 'body4' : 'body1'),
    [size]
  );

  const valueAddress = useMemo(
    () => (sourceVariant === 'address' ? valueProp : undefined),
    [valueProp, sourceVariant]
  );

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
      {valueAddress && (
        <Identicon
          size={getAvatarSizeInPx(size)}
          value={valueAddress}
          theme={theme}
          style={{
            cursor: 'auto',
          }}
        />
      )}

      {!valueAddress && (
        <>
          <AvatarPrimitive.Image
            src={src}
            alt={alt}
            className="object-cover w-full h-full"
          />
          {fallback && (
            <AvatarPrimitive.Fallback
              className={cx(
                'w-full h-full flex justify-center items-center',
                classNames.text
              )}
            >
              <Typography
                variant={typoVariant}
                fw="semibold"
                component="span"
                className={classNames.text}
              >
                {fallback.substring(0, 2)}
              </Typography>
            </AvatarPrimitive.Fallback>
          )}
        </>
      )}
    </AvatarPrimitive.Root>
  );
};
