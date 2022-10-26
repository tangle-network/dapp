import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ArrowLeft = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M7.828 13L13.192 18.364L11.778 19.778L4 12L11.778 4.22195L13.192 5.63595L7.828 11L20 11L20 13L7.828 13Z',
    displayName: 'ArrowLeft',
  });
};
