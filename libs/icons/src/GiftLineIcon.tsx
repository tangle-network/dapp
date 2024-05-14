import { createIcon } from './create-icon.js';
import { IconBase } from './types.js';

const GiftLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M15.005 2.003a4 4 0 013.464 6.001l4.536-.001v2h-2v10a1 1 0 01-1 1h-16a1 1 0 01-1-1v-10h-2v-2l4.536.001a4 4 0 016.465-4.646 3.983 3.983 0 012.999-1.355zm-4 8h-6v9h6v-9zm8 0h-6v9h6v-9zm-10-6a2 2 0 00-.15 3.994l.15.006h2v-2a2 2 0 00-1.697-1.977l-.154-.018-.15-.005zm6 0a2 2 0 00-1.995 1.85l-.005.15v2h2a2 2 0 001.994-1.85l.006-.15a2 2 0 00-2-2z',
    displayName: 'GiftLineIcon',
  });
};

export default GiftLineIcon;
