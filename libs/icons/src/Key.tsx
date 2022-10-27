import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Key = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M10.757 11.828l7.85-7.849 1.413 1.414-1.414 1.415 2.474 2.474-1.414 1.415-2.475-2.475-1.414 1.414 2.121 2.121-1.414 1.415-2.12-2.122-2.193 2.192a5.001 5.001 0 11-8.052-.41 5 5 0 016.638-1.004zm-.637 6.293a3 3 0 10-4.24-4.241 3 3 0 004.241 4.242v-.001z',
    displayName: 'Key',
  });
};
