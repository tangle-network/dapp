import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
} as const;

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => (
  <div
    className={twMerge(
      'animate-spin rounded-full border-2 border-primary border-t-transparent',
      sizeClasses[size],
      className,
    )}
    role="progressbar"
    aria-label="Loading"
  />
);
