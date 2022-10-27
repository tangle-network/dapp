import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Close = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M12.364 10.95L17.314 6l1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95L6 17.314l4.95-4.95L6 7.414 7.414 6l4.95 4.95z'
      />
    ),
    displayName: 'Close',
  });
};
