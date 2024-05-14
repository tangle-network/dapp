import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

export const ArrowDropDownFill = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 14L8 10H16L12 14Z',
    displayName: 'ArrowDropDownFill',
  });
};
