import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ArrowRightUp = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '-8 -8 24 24',
    path: (
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.67 2.276L1.93 8.014.99 7.071l5.737-5.738H1.67V0h7.334v7.333H7.669V2.276z"
      />
    ),
    displayName: 'ArrowRightUp',
  });
};
