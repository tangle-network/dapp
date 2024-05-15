import { createIcon } from './create-icon';
import { IconBase } from './types';

const WalletFillIcon = (props: IconBase) => {
  return createIcon({
    ...props,
    d: 'M2.005 9h19a1 1 0 011 1v10a1 1 0 01-1 1h-18a1 1 0 01-1-1V9zm1-6h15v4h-16V4a1 1 0 011-1zm12 11v2h3v-2h-3z',
    displayName: 'WalletFillIcon',
  });
};

export default WalletFillIcon;
