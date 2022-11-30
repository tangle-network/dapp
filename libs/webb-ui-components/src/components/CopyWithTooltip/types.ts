import { WebbComponentBase } from '../../types';

/**
 * The `CopyWithTooltip` props
 */
export interface CopyWithTooltipProps extends WebbComponentBase {
  /**
   * Represents the text to copy to clipboard
   */
  textToCopy: string;
}

/**
 * The internal UI component
 */
export interface CopyWithTooltipUIProps {
  onClick: () => void;

  className?: string;

  isCopied: boolean;
}
