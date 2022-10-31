import { createIcon } from './create-icon';
import { IconBase } from './types';

export const WalletLineIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    viewBox: '0 0 24 25',
    d: 'M18 7.5h3a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1v-16a1 1 0 011-1h15v4zm-14 2v10h16v-10H4zm0-4v2h12v-2H4zm11 8h3v2h-3v-2z',
    displayName: 'WalletLineIcon',
  });
};
