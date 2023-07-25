import { createIcon } from './create-icon';
import { IconBase } from './types';

export const IndeterminateCircleLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16 8 8 0 000 16zm-5-9h10v2H7v-2z',
    displayName: 'IndeterminateCircleLineIcon',
  });
};
