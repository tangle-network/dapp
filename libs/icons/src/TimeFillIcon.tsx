import { createIcon } from './create-icon';
import type { IconBase } from './types';

export const TimeFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 14 14',
    d: 'M6.75004 13.6668C3.06814 13.6668 0.083374 10.682 0.083374 7.00016C0.083374 3.31826 3.06814 0.333496 6.75004 0.333496C10.4319 0.333496 13.4167 3.31826 13.4167 7.00016C13.4167 10.682 10.4319 13.6668 6.75004 13.6668ZM7.41671 7.00016V3.66683H6.08337V8.3335H10.0834V7.00016H7.41671Z',
    displayName: 'TimeFillIcon',
  });
};
