import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ArrowDropDownFill = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 14L8 10H16L12 14Z',
    displayName: 'ArrowDropDownFill',
  });
};
