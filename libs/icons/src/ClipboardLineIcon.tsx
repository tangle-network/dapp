import { createIcon } from './create-icon';
import { IconBase } from './types';

const ClipboardLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M7 4V2h10v2h3.007c.548 0 .993.445.993.993v16.014a.994.994 0 01-.993.993H3.993A.993.993 0 013 21.007V4.993C3 4.445 3.445 4 3.993 4H7zm0 2H5v14h14V6h-2v2H7V6zm2-2v2h6V4H9z',
    displayName: 'ClipboardLineIcon',
  });
};

export default ClipboardLineIcon;
