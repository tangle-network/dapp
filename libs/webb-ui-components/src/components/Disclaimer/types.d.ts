import { PropsOf } from '@webb-tools/webb-ui-components/types';

export type DisclaimerVariant = 'info' | 'error' | 'warning' | 'success';
/**
 * @param variant - Disclaimer variant will show the fitting colors and icon
 * @param message - Disclaimer text message
 * */
export interface DisclaimerProps extends PropsOf<'div'> {
  /**
   * Disclaimer variant will show the fitting colors and icon
   * */
  variant: DisclaimerVariant;
  /**
   *  Disclaimer text message
   * */
  message: string;
}
