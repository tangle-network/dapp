import { Typography } from '../../typography';
import cx from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { AlertProps } from './types';
import {
  AlertFill,
  CheckboxCircleLine,
  CheckboxFill,
  InformationLine,
} from '@webb-tools/icons';

/**
 * Webb Alert component
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
export const Alert: React.FC<AlertProps> = ({
  className,
  size = 'md',
  type = 'info',
  description,
  title,
}) => {
  const iconSize = useMemo(() => (size === 'md' ? 'lg' : 'md'), [size]);

  return (
    <div
      className={cx(
        'flex w-full px-4 py-2 space-x-1 border rounded-lg',
        'text-blue-70 dark:text-blue-50',
        'bg-blue-10/50 dark:bg-blue-120 border-blue-10 dark:border-blue-90'
      )}
    >
      {type === 'success' ? (
        <CheckboxCircleLine size={iconSize} className="!fill-current" />
      ) : (
        <InformationLine size={iconSize} className="!fill-current" />
      )}

      <div className="flex flex-col justify-start items-start gap-1 dark:text-blue-70">
        <Typography
          variant="body1"
          fw="semibold"
          className="capitalize !text-current"
        >
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" fw="normal" className="!text-current">
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
};
