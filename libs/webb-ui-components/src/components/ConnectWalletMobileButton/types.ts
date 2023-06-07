import { ButtonProps } from '../Button/types';
import { IWebbComponentBase } from '../../types';

export interface ConnectWalletMobileButtonProps
  extends IWebbComponentBase,
    Pick<
      ButtonProps,
      'variant' | 'isFullWidth' | 'leftIcon' | 'rightIcon' | 'size' | 'variant'
    > {}
