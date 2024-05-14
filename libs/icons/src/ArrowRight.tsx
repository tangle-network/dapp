import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

export const ArrowRight = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 24 25',
    d: 'M16.172 11.5l-5.364-5.363 1.414-1.414L20 12.5l-7.778 7.778-1.414-1.414 5.364-5.364H4v-2h12.172z',
    displayName: 'ArrowRight',
  });
};
