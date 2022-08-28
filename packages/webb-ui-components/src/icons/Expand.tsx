import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Expand = (props: IconBase) => {
  return createIcon({
    ...props,
    path: [
      <path
        d='M17.4439 17.5592L17.6044 10.5606L19.6036 10.6065L19.3972 19.6042L10.3995 19.3978L10.4454 17.3986L17.4439 17.5592Z'
        fill='inhterit'
      />,
      <path
        d='M6.49973 6.49979L6.49973 13.5002L4.50003 13.5002L4.50003 4.5001L13.5001 4.5001L13.5001 6.49979L6.49973 6.49979Z'
        fill='inherit'
      />,
    ],
    displayName: 'Expand',
  });
};
