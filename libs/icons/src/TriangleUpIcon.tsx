import { createIcon } from './create-icon';
import { IconBase } from './types';

export const TriangleUpIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 1.67a2.914 2.914 0 0 0 -2.492 1.403l-8.11 13.537a2.914 2.914 0 0 0 2.484 4.385h16.225a2.914 2.914 0 0 0 2.503 -4.371l-8.116 -13.546a2.917 2.917 0 0 0 -2.494 -1.408z',
    displayName: 'TriangleUpIcon',
  });
};
