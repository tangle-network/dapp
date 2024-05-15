import { CheckboxBlankCircleLine } from '@webb-tools/icons/CheckboxBlankCircleLine.js';
import cx from 'classnames';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { BadgeColor, BadgeProps } from './types.js';

const classNames: {
  [key in BadgeColor]: {
    icon: string;
    wrapper: string;
  };
} = {
  green: {
    icon: cx('fill-green-90 dark:fill-green-30'),
    wrapper: cx('fill-green-10 dark:fill-green-120'),
  },
  blue: {
    icon: cx('fill-blue-90 dark:fill-blue-30'),
    wrapper: cx('fill-blue-10 dark:fill-blue-120'),
  },
  purple: {
    icon: cx('fill-purpose-90 dark:fill-purpose-30'),
    wrapper: cx('fill-purpose-10 dark:fill-purpose-120'),
  },
  red: {
    icon: cx('fill-red-90 dark:fill-red-30'),
    wrapper: cx('fill-red-10 dark:fill-red-120'),
  },
  yellow: {
    icon: cx('fill-yellow-90 dark:fill-yellow-30'),
    wrapper: cx('fill-yellow-10 dark:fill-yellow-120'),
  },
};

const Badge = forwardRef<SVGSVGElement, BadgeProps>(
  ({ icon = <CheckboxBlankCircleLine />, color = 'blue', ...props }, ref) => {
    return (
      <svg
        {...props}
        width={24}
        height={24}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={ref}
      >
        <rect
          width={24}
          height={24}
          rx={12}
          className={classNames[color].wrapper}
        />
        <foreignObject x={4} y={4} width={16} height={16}>
          {cloneElement(icon, {
            ...icon.props,
            className: twMerge(icon.props.className, classNames[color].icon),
            size: 'md',
          })}
        </foreignObject>
      </svg>
    );
  }
);

export default Badge;
