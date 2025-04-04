import { IconSize } from '@tangle-network/icons/types';
import { ComponentBase } from '../../types';

/**
 * The `CopyWithTooltip` props
 */
export interface CopyWithTooltipProps extends ComponentBase {
  /**
   * Represents the text to copy to clipboard
   */
  textToCopy: string;

  /**
   * Display the icon inside the button or just the icon
   */
  isButton?: boolean;

  /**
   * The icon size, possible values: `md` (16px), `lg` (24px), `xl` (48px)
   * @default "md"
   */
  iconSize?: IconSize;

  /**
   * The icon class name
   */
  iconClassName?: string;

  copyLabel?: string;
}

/**
 * The internal UI component
 */
export interface CopyWithTooltipUIProps
  extends Pick<
    CopyWithTooltipProps,
    'isButton' | 'iconSize' | 'iconClassName' | 'copyLabel'
  > {
  onClick: () => void;

  className?: string;

  isCopied: boolean;
}
