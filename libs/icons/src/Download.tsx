import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Download = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M2 13.654h12v1.334H2v-1.334zM8.667 9.77l4.047-4.048.943.943L8 12.32 2.343 6.664l.943-.943 4.047 4.047V2.32h1.334v7.448z',
    viewBox: '0 0 16 17',
    displayName: 'Download',
  });
};
