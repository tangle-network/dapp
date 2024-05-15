import { createIcon } from './create-icon';
import { IconBase } from './types';

const WalletLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M18.005 7h3a1 1 0 011 1v12a1 1 0 01-1 1h-18a1 1 0 01-1-1V4a1 1 0 011-1h15v4zm-14 2v10h16V9h-16zm0-4v2h12V5h-12zm11 8h3v2h-3v-2z',
    displayName: 'WalletLineIcon',
  });
};

export default WalletLineIcon;
