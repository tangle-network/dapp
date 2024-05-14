import { ButtonProps } from '../buttons/types.js';
import { IWebbComponentBase } from '../../types/index.js';

export interface ConnectWalletMobileButtonProps
  extends IWebbComponentBase,
    Pick<
      ButtonProps,
      'variant' | 'isFullWidth' | 'leftIcon' | 'rightIcon' | 'size' | 'variant'
    > {
  title?: string;
  extraActionButtons?: Array<ButtonProps>;
}
