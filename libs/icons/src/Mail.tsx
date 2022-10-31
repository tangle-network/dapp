import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Mail = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M3 3h18a1 1 0 011 1v16a1 1 0 01-1 1H3a1 1 0 01-1-1V4a1 1 0 011-1zm17 4.238l-7.928 7.1L4 7.216V19h16V7.238zM4.511 5l7.55 6.662L19.502 5H4.511z',
    displayName: 'Mail',
  });
};
