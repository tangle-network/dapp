import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const BillFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M20.5 22H4.5C3.94772 22 3.5 21.5523 3.5 21V3C3.5 2.44772 3.94772 2 4.5 2H20.5C21.0523 2 21.5 2.44772 21.5 3V21C21.5 21.5523 21.0523 22 20.5 22ZM8.5 9V11H16.5V9H8.5ZM8.5 13V15H16.5V13H8.5Z',
    displayName: 'BillFillIcon',
  });
};

export default BillFillIcon;
