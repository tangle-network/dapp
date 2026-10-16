import type {
  Tooltip as SharedTooltip,
  TooltipContent,
  TooltipTrigger,
} from '@tangle-network/ui/tooltip';
import type { ComponentPropsWithoutRef } from 'react';
import { IComponentBase } from '../../types';

type RdxTooltipContentProps = Omit<
  ComponentPropsWithoutRef<typeof TooltipContent>,
  'portal'
>;
type RdxTooltipPropsBase = ComponentPropsWithoutRef<typeof SharedTooltip>;
type RdxTooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipTrigger>;

type OmittedKeys =
  | 'open'
  | 'defaultOpen'
  | 'disableHoverableContent'
  | 'onOpenChange';

type TooltipPropsBase = Omit<RdxTooltipPropsBase, OmittedKeys>;

export interface TooltipProps extends IComponentBase, TooltipPropsBase {
  /**
   * The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.
   */
  isDefaultOpen?: boolean;
  /**
   * The controlled open state of the tooltip. Must be used in conjunction with onOpenChange.
   */
  isOpen?: boolean;
  /**
   * Event handler called when the open state of the tooltip changes.
   */
  onChange?: (nextVal: boolean) => void;
  /**
   * Prevents Tooltip.Content from remaining open when hovering. Disabling this has accessibility consequences. Inherits from Tooltip.Provider.
   */
  isDisableHoverableContent?: boolean;
}

/**
 * The `TooltipBody` props
 */
export interface TooltipBodyProps
  extends IComponentBase,
    RdxTooltipContentProps {
  /**
   * The `title` of the tooltip content
   */
  title?: string;

  /**
   * The `button` below the tooltip content
   */
  button?: React.ReactElement;

  /**
   * Not render the tooltip inside a portal
   */
  isDisablePortal?: boolean;
}

/**
 * The `TooltipTrigger` props
 */
export interface TooltipTriggerProps
  extends IComponentBase,
    RdxTooltipTriggerProps {}
