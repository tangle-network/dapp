import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ThreeDotsVerticalIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    displayName: 'ThreeDotsVerticalIcon',
  });
};
