import * as AvatarPrimitive from '@radix-ui/react-avatar';
import cx from 'classnames';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Typography } from '../../typography/Typography';
import { Identicon } from './Identicon';
import { AvatarProps } from './types';
import { getAvatarClassNames, getAvatarSizeInPx } from './utils';
import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';

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
export const Avatar: React.FC<AvatarProps> = ({
  alt,
  className: outerClassName,
  darkMode,
  fallback,
  size = 'md',
  sourceVariant = 'address',
  src,
  theme = 'polkadot',
  value: valueProp,
  tooltip,
}) => {
  const sizeClassName = (() => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-12 h-12';
    }
  })();

  const classNames = useMemo(() => {
    return getAvatarClassNames(darkMode);
  }, [darkMode]);

  const typoVariant = size === 'md' ? 'body4' : 'body1';
  const valueAddress = sourceVariant === 'address' ? valueProp : undefined;

  const avatar = (
    <AvatarPrimitive.Root
      onClick={(event) => {
        event.stopPropagation();
      }}
      className={twMerge(
        'inline-flex items-center justify-center align-middle overflow-hidden rounded-full border box-border',
        sizeClassName,
        classNames.borderColor,
        classNames.bg,
        outerClassName,
      )}
    >
      {valueAddress && (
        <Identicon
          size={getAvatarSizeInPx(size)}
          value={valueAddress}
          theme={theme}
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
                classNames.text,
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

  return tooltip !== undefined ? (
    <Tooltip>
      <TooltipTrigger onClick={(event) => event.stopPropagation()}>
        {avatar}
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  ) : (
    avatar
  );
};
