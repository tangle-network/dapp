import { createIcon } from './create-icon';
import { IconBase } from './types';

export const SparklingIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 32 32',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.668.61l1.758 3.297 3.297 1.759-3.297 1.758-1.758 3.298-1.759-3.298-3.297-1.758 3.297-1.759L22.668.61zm-12 4.167l3.555 6.667 6.667 3.555-6.667 3.556-3.556 6.666-3.555-6.666-6.667-3.556 6.667-3.555 3.556-6.667zm15.555 16l-2.222-4.167-2.222 4.167-4.167 2.222 4.167 2.222L24 29.388l2.222-4.167L30.39 23l-4.167-2.222z"
      />
    ),
    displayName: 'SparklingIcon',
  });
};
