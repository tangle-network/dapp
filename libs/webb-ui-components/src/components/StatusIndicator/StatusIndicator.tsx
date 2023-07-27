import cx from 'classnames';
import { forwardRef } from 'react';
import { StatusIndicatorProps, StatusVariant } from './types';
import { twMerge } from 'tailwind-merge';

const base = cx('border-opacity-30 w-[6px] h-[6px] rounded-full border-[3px]');

const classes: {
  [key in StatusVariant]: string;
} = {
  success: cx(
    'bg-green-70 dark:bg-green-50',
    'border-[#288E32] dark:border-[#4CB457]'
  ),
  warning: cx(
    'bg-yellow-70 dark:bg-yellow-50',
    'border-[#EAB612] dark:border-[#F8D567]'
  ),
  error: cx(
    'bg-red-70 dark:bg-red-50',
    'border-[#EF570D] dark:border-[#FF874D]'
  ),
  info: cx(
    'bg-blue-70 dark:bg-blue-50',
    'border-[#23579D] dark:border-[#23579D]'
  ),
};

const StatusIndicator = forwardRef<HTMLSpanElement, StatusIndicatorProps>(
  ({ className, variant = 'info', ...props }, ref) => {
    return (
      <span ref={ref} className={twMerge(base, classes[variant], className)} />
    );
  }
);

export default StatusIndicator;
