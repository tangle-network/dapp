import { type FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type SkeletonSize = 'md' | 'lg' | 'xl' | '2xl';

export interface SkeletonLoaderProps {
  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px), `2xl` (64px)
   * @default "md"
   */
  size?: SkeletonSize;

  className?: string;

  as?: 'div' | 'span';
}

export function getHeightBySize(size: SkeletonSize) {
  switch (size) {
    case '2xl': {
      return 'h-24' as const;
    }

    case 'xl': {
      return 'h-12' as const;
    }
    case 'lg': {
      return 'h-6' as const;
    }
    case 'md': {
      return 'h-4' as const;
    }
  }
}

const SkeletonLoader: FC<SkeletonLoaderProps> = ({
  size = 'md',
  className,
  as = 'div',
}) => {
  const Component = as;

  return (
    <Component
      className={twMerge(
        'animate-pulse bg-mono-20 dark:bg-mono-160 w-full rounded-md',
        getHeightBySize(size),
        className,
      )}
    />
  );
};

export default SkeletonLoader;
