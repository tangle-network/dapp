import { createIcon } from './create-icon';
import { IconBase } from './types';

export const FileUploadLine = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M15 4H5v16h14V8h-4V4zM3 2.992C3 2.444 3.447 2 3.999 2H16l5 5v13.993A1 1 0 0120.007 22H3.993A1 1 0 013 21.008V2.992zM13 12v4h-2v-4H8l4-4 4 4h-3z',
    displayName: 'FileUploadLine',
  });
};
