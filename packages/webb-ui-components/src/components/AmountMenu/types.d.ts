import { PropsOf } from '@webb-dapp/webb-ui-components/types';

export interface AmountMenuProps extends PropsOf<'div'> {
  /**
   * Selected value
   */
  selected?: 'fixed' | 'custom';

  /**
   * Callback when user hits change input button
   */
  onChange?: (nextVal: 'fixed' | 'custom') => void;
}
