import { createIcon } from './create-icon';
import { IconBase } from './types';

const FileLine = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M14 5.33301V13.9951C14 14.3664 13.7035 14.6663 13.3377 14.6663H2.66227C2.29663 14.6663 2 14.3703 2 14.0051V1.99421C2 1.63655 2.29913 1.33301 2.66814 1.33301H9.99787L14 5.33301ZM12.6667 5.99967H9.33333V2.66634H3.33333V13.333H12.6667V5.99967Z',
    displayName: 'FileLine',
  });
};

export default FileLine;
