import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ChevronRight = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M13.1727 12L8.22266 7.04999L9.63666 5.63599L16.0007 12L9.63666 18.364L8.22266 16.95L13.1727 12Z',
    displayName: 'ChevronRight',
  });
};
