import { WebbComponentBase } from '@webb-dapp/webb-ui-components/types';
import { WebbTypographyVariant } from '@webb-dapp/webb-ui-components/typography/types';

/**
 * The `LabelWithValue` props
 */
export interface LabelWithValueProps extends WebbComponentBase {
  /**
   * The label value
   */
  label: string;
  /**
   * The label variant
   * @default "body4"
   */
  labelVariant?: WebbTypographyVariant;
  /**
   * The value to display
   */
  value: string | number;
  /**
   * The label variant
   * @default "body2"
   */
  valueVariant?: WebbTypographyVariant;
  /**
   * The value will have the tooltip that contains the `valueTooltip` string to describe for the value.
   * Usually use for shorten hex string
   */
  valueTooltip?: string;
}
