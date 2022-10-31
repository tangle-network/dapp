import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Menu = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M3.40625 4H23.8491V6H3.40625V4ZM3.40625 11H23.8491V13H3.40625V11ZM3.40625 18H23.8491V20H3.40625V18Z'
      />
    ),
    displayName: 'Menu',
  });
};
