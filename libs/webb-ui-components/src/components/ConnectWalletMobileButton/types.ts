import { ButtonProps } from '../buttons/types';
import { IWebbComponentBase } from '../../types';

export type MobileButtonProps = {
  appType?: 'bridge-dapp' | 'tangle-dapp';
};

export interface ConnectWalletMobileButtonProps
  extends IWebbComponentBase,
    Pick<
      ButtonProps,
      'variant' | 'isFullWidth' | 'leftIcon' | 'rightIcon' | 'size' | 'variant'
    >,
    MobileButtonProps {}
