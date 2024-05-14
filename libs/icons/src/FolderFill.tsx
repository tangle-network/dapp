import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const FolderFill = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 16 16',
    d: 'M8.27874 3.33333H14.0026C14.3708 3.33333 14.6693 3.63181 14.6693 4V13.3333C14.6693 13.7015 14.3708 14 14.0026 14H2.0026C1.63442 14 1.33594 13.7015 1.33594 13.3333V2.66667C1.33594 2.29848 1.63442 2 2.0026 2H6.9454L8.27874 3.33333Z',
    displayName: 'FolderFill',
  });
};

export default FolderFill;
