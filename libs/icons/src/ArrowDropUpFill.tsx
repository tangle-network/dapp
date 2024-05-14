import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

export const ArrowDropUpFill = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 10L16 14H8L12 10Z',
    displayName: 'ArrowDropUpFill',
  });
};
