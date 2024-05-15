import { createIcon } from './create-icon';
import { IconBase } from './types';

export const IndeterminateCircleFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM7 11V13H17V11H7Z',
    displayName: 'IndeterminateCircleFillIcon',
  });
};
