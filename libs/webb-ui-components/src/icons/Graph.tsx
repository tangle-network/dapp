import { createIcon } from './create-icon';
import { IconBase } from './types';

export const Graph = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5 19V3H3V21H21V19H5ZM21.707 7.707L20.293 6.293L16 10.585L13 7.586L7.293 13.293L8.707 14.707L13 10.415L16 13.414L21.707 7.707Z'
        fill='inherit'
      />
    ),
    displayName: 'Graph',
  });
};
