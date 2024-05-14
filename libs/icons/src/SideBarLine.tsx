import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const SideBarLine = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M2.0026 2H14.0026C14.3708 2 14.6693 2.29848 14.6693 2.66667V13.3333C14.6693 13.7015 14.3708 14 14.0026 14H2.0026C1.63442 14 1.33594 13.7015 1.33594 13.3333V2.66667C1.33594 2.29848 1.63442 2 2.0026 2ZM5.33594 3.33333H2.66927V12.6667H5.33594V3.33333ZM6.66927 3.33333V12.6667H13.3359V3.33333H6.66927Z',
    displayName: 'SideBarLine',
  });
};

export default SideBarLine;
