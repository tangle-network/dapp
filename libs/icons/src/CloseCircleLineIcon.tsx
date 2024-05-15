import { createIcon } from './create-icon';
import { IconBase } from './types';

export const CloseCircleLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M12 22.5c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 100-16.001A8 8 0 0012 20.5zm0-9.414l2.828-2.829 1.415 1.415-2.829 2.828 2.829 2.828-1.415 1.415L12 13.914l-2.828 2.829-1.415-1.415 2.829-2.828-2.829-2.828 1.415-1.415L12 11.086z',
    displayName: 'CloseCircleLineIcon',
  });
};
