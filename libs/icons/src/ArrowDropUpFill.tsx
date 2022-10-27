import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ArrowDropUpFill = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 10L16 14H8L12 10Z',
    displayName: 'ArrowDropUpFill',
  });
};
