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
   * Display the icon inside the button or just the icon
   */
  isButton?: boolean;
}

/**
 * The internal UI component
 */
export interface CopyWithTooltipUIProps {
  onClick: () => void;

  className?: string;

  isCopied: boolean;

  /**
   * Display the icon inside the button or just the icon
   */
  isButton?: boolean;
}
