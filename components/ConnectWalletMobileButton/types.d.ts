import { ButtonProps } from '../buttons/types';
import { IComponentBase } from '../../types';
export interface ConnectWalletMobileButtonProps extends IComponentBase, Pick<ButtonProps, 'variant' | 'isFullWidth' | 'leftIcon' | 'rightIcon' | 'size' | 'variant'> {
    title?: string;
    extraActionButtons?: Array<ButtonProps>;
}
