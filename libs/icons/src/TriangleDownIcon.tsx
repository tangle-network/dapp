import { createIcon } from './create-icon';
import { IconBase } from './types';

export const TriangleDownIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M20.118 3h-16.225a2.914 2.914 0 0 0 -2.503 4.371l8.116 13.549a2.917 2.917 0 0 0 4.987 .005l8.11 -13.539a2.914 2.914 0 0 0 -2.486 -4.386z',
    displayName: 'TriangleDownIcon',
  });
};
