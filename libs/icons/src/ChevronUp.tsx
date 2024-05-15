import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ChevronUp = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 10.828l-4.95 4.95-1.413-1.414L12 8l6.364 6.364-1.414 1.414-4.95-4.95z',
    displayName: 'ChevronUp',
  });
};
