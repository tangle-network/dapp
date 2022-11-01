import { WebbComponentBase } from '../../types';

/**
 * The `CopyWithTooltip` props
 */
export interface CopyWithTooltipProps extends WebbComponentBase {
  /**
   * Represents the text to copy to clipboard
   */
  textToCopy: string;
  /**
   * Whether use the `span` for trigger instead of `button`
   */
  isUseSpan?: boolean;
}
