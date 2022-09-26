import { createIcon } from './create-icon';
import { IconBase } from './types';

export const CheckboxBlankCircleLine = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16.001A8 8 0 0012 20zm-.997-4L6.76 11.757l1.414-1.414 2.829 2.829 5.656-5.657 1.415 1.414L11.003 16z',
    displayName: 'CheckboxBlankCircleLine',
  });
};
