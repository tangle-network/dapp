import { createIcon } from './create-icon';
import { IconBase } from './types';

export const InformationLine = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M7.999 14.667a6.666 6.666 0 110-13.333 6.666 6.666 0 010 13.333zm0-1.333a5.333 5.333 0 100-10.667 5.333 5.333 0 000 10.667zm-.667-8.667h1.333V6H7.332V4.667zm0 2.667h1.333v4H7.332v-4z',
    displayName: 'InformationLine',
  });
};
