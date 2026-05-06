import { createIcon } from './create-icon';
import { IconBase } from './types';

export const UndoIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 13 14',
    d: 'M4.33337 4.1665V6.83317L0.333374 3.49984L4.33337 0.166504V2.83317H7.66671C10.6122 2.83317 13 5.22098 13 8.1665C13 11.112 10.6122 13.4998 7.66671 13.4998H1.66671V12.1665H7.66671C9.87584 12.1665 11.6667 10.3756 11.6667 8.1665C11.6667 5.95736 9.87584 4.1665 7.66671 4.1665H4.33337Z',
    displayName: 'UndoIcon',
  });
};
