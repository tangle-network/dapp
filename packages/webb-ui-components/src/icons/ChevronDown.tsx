import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ChevronDown = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 13.172l4.95-4.95 1.415 1.414L12 16 5.637 9.636 7.05 8.222l4.95 4.95z',
    displayName: 'ChevronDown',
  });
};
