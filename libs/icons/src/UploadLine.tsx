import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const UploadLine = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M3 19H21V21H3V19ZM13 5.82843V17H11V5.82843L4.92893 11.8995L3.51472 10.4853L12 2L20.4853 10.4853L19.0711 11.8995L13 5.82843Z',
    displayName: 'UploadLine',
  });
};

export default UploadLine;
