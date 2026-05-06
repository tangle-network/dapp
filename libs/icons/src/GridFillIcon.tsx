import { createIcon } from './create-icon';
import { IconBase } from './types';

export const GridFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    path: (
      <path d="M14.5 10V14H10.5V10H14.5ZM16.5 10H21.5V14H16.5V10ZM14.5 21H10.5V16H14.5V21ZM16.5 21V16H21.5V20C21.5 20.5523 21.0523 21 20.5 21H16.5ZM14.5 3V8H10.5V3H14.5ZM16.5 3H20.5C21.0523 3 21.5 3.44772 21.5 4V8H16.5V3ZM8.5 10V14H3.5V10H8.5ZM8.5 21H4.5C3.94772 21 3.5 20.5523 3.5 20V16H8.5V21ZM8.5 3V8H3.5V4C3.5 3.44772 3.94772 3 4.5 3H8.5Z" />
    ),
    displayName: 'GridFill',
  });
};
