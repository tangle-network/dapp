import { createIcon } from './create-icon';
import { IconBase } from './types';

export const BookLockIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    colorUsingStroke: true,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    path: (
      <>
        <path d="M18 6V4a2 2 0 1 0-4 0v2" />
        <path d="M20 15v6a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H10" />
        <rect x="12" y="6" width="8" height="5" rx="1" />
      </>
    ),
    displayName: 'BookLockIcon',
  });
};
