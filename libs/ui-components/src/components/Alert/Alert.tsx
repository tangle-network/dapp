import {
  AlertFill,
  CheckboxCircleFill,
  InformationLineFill,
} from '@tangle-network/icons';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography/Typography';
import { AlertProps } from './types';
import {
  getClassNamesByType,
  getDescriptionClassNamesBySize,
  getIconClassNamesByType,
  getTitleClassNamesBySize,
  getTypographyClassNamesByType,
} from './utils';

/**
 * Alert component
 *
 * Props:
 *
 * - `size`: Alert size - `md` (default), `lg`
 * - `type`: Alert type - `info` (default), `success`, `error`
 * - `title`: Alert title
 * - `description`: Alert description
 * - `className`: Outer class name
 *
 * @example
 *
 * <Alert title="Transaction Status" description="Your transaction was successful!" type='success' />
 */
export const Alert: React.FC<AlertProps> = ({
  className,
  size = 'md',
  type = 'info',
  description,
  title,
}) => {
  const iconSize = size === 'md' ? '16px' : '12px';

  const iconClassName = 'fill-current dark:fill-current mt-1';

  return (
    <div
      className={twMerge(
        className,
        'flex w-full p-3 rounded-lg gap-2',
        getClassNamesByType(type),
      )}
    >
      <div className={getIconClassNamesByType(type)}>
        {type === 'success' ? (
          <CheckboxCircleFill
            width={iconSize}
            height={iconSize}
            className={iconClassName}
          />
        ) : type === 'error' || type === 'warning' ? (
          <AlertFill
            width={iconSize}
            height={iconSize}
            className={iconClassName}
          />
        ) : (
          <InformationLineFill
            width={iconSize}
            height={iconSize}
            className={iconClassName}
          />
        )}
      </div>

      <div className="flex flex-col">
        <Typography
          variant="body2"
          className={twMerge(
            getTypographyClassNamesByType(type),
            getTitleClassNamesBySize(size),
          )}
        >
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            className={twMerge(
              getTypographyClassNamesByType(type),
              getDescriptionClassNamesBySize(size),
            )}
          >
            {description}
          </Typography>
        )}
      </div>
    </div>
  );
};
