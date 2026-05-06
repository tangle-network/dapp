import { createIcon } from './create-icon';
import type { IconBase } from './types';

const LockFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M19 10h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11a1 1 0 0 1 1-1h1V9a7 7 0 0 1 14 0zm-2 0V9A5 5 0 0 0 7 9v1zm-6 4v4h2v-4z',
    displayName: 'LockFillIcon',
  });
};

export default LockFillIcon;
