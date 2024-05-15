import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ChevronLeft = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M10.8273 12L15.7773 16.95L14.3633 18.364L7.99934 12L14.3633 5.63601L15.7773 7.05001L10.8273 12Z',
    displayName: 'ChevronLeft',
  });
};
