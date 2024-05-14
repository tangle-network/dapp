import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

export const ArrowRightUp = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M16.0032 9.41421L7.39663 18.0208L5.98242 16.6066L14.589 8H7.00324V6H18.0032V17H16.0032V9.41421Z',
    displayName: 'ArrowRightUp',
  });
};
