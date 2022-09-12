import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';

/**
 * The `LabelWithValue` props
 */
export interface LabelWithValueProps extends WebbComponentBase {
  /**
   * The label value
   */
  label: string;
  /**
   * The value to display
   */
  value: string | number;
  /**
   * If `true`, it will displays only value
   */
  isHiddenLabel?: boolean;
}
