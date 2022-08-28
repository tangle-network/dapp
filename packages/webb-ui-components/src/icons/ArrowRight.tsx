import { createIcon } from './create-icon';
import { IconBase } from './types';

export const ArrowRight = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M16.172 11L10.808 5.63605L12.222 4.22205L20 12L12.222 19.778L10.808 18.364L16.172 13H4V11H16.172Z',
    displayName: 'ArrowRight',
  });
};
