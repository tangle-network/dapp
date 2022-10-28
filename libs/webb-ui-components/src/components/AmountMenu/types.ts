import { PropsOf } from '../../types';

export interface AmountMenuProps extends Omit<PropsOf<'div'>, 'onChange'> {
  /**
   * Selected value
   */
  selected?: 'fixed' | 'custom';

  /**
   * Callback when user hits change input button
   */
  onChange?: (nextVal: 'fixed' | 'custom') => void;
}
