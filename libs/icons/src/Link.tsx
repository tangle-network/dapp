import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Link = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M18.365 15.536l-1.414-1.416 1.414-1.414a5 5 0 10-7.07-7.071L9.88 7.05 8.465 5.636l1.416-1.414a7 7 0 119.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 01-9.9-9.9l1.415-1.414L7.051 9.88l-1.414 1.414a5 5 0 107.071 7.071l1.414-1.414 1.415 1.414v-.001zM14.83 7.757l1.415 1.415-7.07 7.07-1.416-1.414 7.071-7.07v-.001z',
    displayName: 'Link',
  });
};
