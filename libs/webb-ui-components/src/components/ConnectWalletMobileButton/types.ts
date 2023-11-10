import { ButtonProps } from '../buttons/types';
import { IWebbComponentBase } from '../../types';

export type MobileButtonProps = {
  title?: string;
  extraActionButtons?: Array<ButtonProps>;
};

export interface ConnectWalletMobileButtonProps
  extends IWebbComponentBase,
    Pick<
      ButtonProps,
      'variant' | 'isFullWidth' | 'leftIcon' | 'rightIcon' | 'size' | 'variant'
    >,
    MobileButtonProps {}
