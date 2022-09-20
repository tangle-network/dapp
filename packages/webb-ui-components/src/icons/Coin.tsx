import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Coin = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12ZM20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12ZM12.0008 7.05005L16.9508 12L12.0008 16.95L7.05078 12L12.0008 7.05005ZM9.879 12L12 9.879L14.121 12L12 14.121L9.879 12Z'
      />
    ),
    displayName: 'Coin',
  });
};
