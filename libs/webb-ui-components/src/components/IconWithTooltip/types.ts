import {
  TooltipBodyProps,
  TooltipProps,
  TooltipTriggerProps,
} from '../Tooltip/types';

export interface IconWithTooltipProp {
  /**
   * The icon to display
   */
  icon: React.ReactNode;

  /**
   * The tooltip content
   */
  content: React.ReactNode;

  /**
   * Override tooltip props
   */
  overrideTooltipProps?: Partial<TooltipProps>;

  /**
   * Override tooltip trigger props
   */
  overrideTooltipTriggerProps?: Partial<TooltipTriggerProps>;

  /**
   * Override tooltip body props
   */
  overrideTooltipBodyProps?: Partial<TooltipBodyProps>;
}
