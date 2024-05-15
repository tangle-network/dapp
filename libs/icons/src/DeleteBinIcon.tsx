import { createIcon } from './create-icon';
import { IconBase } from './types';

export const DeleteBinIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M17 6h5v2h-2v13a1 1 0 01-1 1H5a1 1 0 01-1-1V8H2V6h5V3a1 1 0 011-1h8a1 1 0 011 1v3zm1 2H6v12h12V8zM9 4v2h6V4H9z',
    displayName: 'DeleteBinIcon',
  });
};
