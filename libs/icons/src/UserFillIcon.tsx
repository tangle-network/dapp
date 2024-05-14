import { createIcon } from './create-icon.js';
import type { IconBase } from './types.js';

const UserFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M4 22a8 8 0 1116 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z',
    displayName: 'UserFillIcon',
  });
};

export default UserFillIcon;
