import { SkeletonSize } from './types';

export function getHeightBySize(size: SkeletonSize) {
  switch (size) {
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
