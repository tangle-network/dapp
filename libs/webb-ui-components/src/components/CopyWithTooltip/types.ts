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

export interface CopyWithTooltipUIProps {
  onClick: () => void;

  className?: string;

  isCopied: boolean;
}
