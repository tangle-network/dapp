import { createIcon } from './create-icon';
import { IconBase } from './types';

export const TimeLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M8 14.667A6.667 6.667 0 118 1.334a6.667 6.667 0 010 13.333zm0-1.334A5.333 5.333 0 108 2.667a5.333 5.333 0 000 10.666zM8.666 8h2.667v1.333h-4V4.667h1.333V8z',
    displayName: 'TimeLineIcon',
  });
};
