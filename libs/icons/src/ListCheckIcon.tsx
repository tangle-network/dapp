import { createIcon } from './create-icon';
import { IconBase } from './types';

const ListCheckIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M8.00008 6.5V9.5H5.00008V6.5H8.00008ZM3.00008 4.5V11.5H10.0001V4.5H3.00008ZM13.0001 4.5H21.0001V6.5H13.0001V4.5ZM13.0001 11.5H21.0001V13.5H13.0001V11.5ZM13.0001 18.5H21.0001V20.5H13.0001V18.5ZM10.7072 16.7071L9.29297 15.2929L6.00008 18.5858L4.20718 16.7929L2.79297 18.2071L6.00008 21.4142L10.7072 16.7071Z',
    displayName: 'Mail',
  });
};

export default ListCheckIcon;
