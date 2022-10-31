import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FlaskLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M16 2v2h-1v3.243c0 1.158.251 2.301.736 3.352l4.282 9.276A1.5 1.5 0 0118.656 22H5.344a1.5 1.5 0 01-1.362-2.129l4.282-9.276A7.994 7.994 0 009 7.243V4H8V2h8zm-2.612 8.001h-2.776c-.104.363-.23.721-.374 1.071l-.158.361L6.125 20h11.749l-3.954-8.567a9.976 9.976 0 01-.532-1.432zM11 7.243c0 .253-.01.506-.029.758h2.058a8.848 8.848 0 01-.021-.364L13 7.243V4h-2v3.243z',
    displayName: 'FlaskLineIcon',
  });
};
