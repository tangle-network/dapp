import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FileCopyLine = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M7 6V3C7 2.44772 7.44772 2 8 2H20C20.5523 2 21 2.44772 21 3V17C21 17.5523 20.5523 18 20 18H17V21C17 21.552 16.55 22 15.993 22H4.007C3.74065 22.0016 3.48465 21.897 3.29566 21.7093C3.10666 21.5216 3.00026 21.2664 3 21L3.003 7C3.003 6.448 3.453 6 4.01 6H7ZM5.003 8L5 20H15V8H5.003ZM9 6H17V16H19V4H9V6Z'
      />
    ),
    displayName: 'FileCopyLine',
  });
};
