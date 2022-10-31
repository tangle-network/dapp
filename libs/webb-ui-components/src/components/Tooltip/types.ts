import {
  TooltipContentProps as RdxTooltipContentProps,
  TooltipProps as RdxTooltipPropsBase,
  TooltipTriggerProps as RdxTooltipTriggerProps,
} from '@radix-ui/react-tooltip';
import { IWebbComponentBase } from '../../types';
import React from 'react';

type OmittedKeys = 'open' | 'defaultOpen' | 'disableHoverableContent' | 'onOpenChange';

type TooltipPropsBase = Omit<RdxTooltipPropsBase, OmittedKeys>;

export interface TooltipProps extends IWebbComponentBase, TooltipPropsBase {
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
export interface TooltipBodyProps extends IWebbComponentBase, RdxTooltipContentProps {
  /**
   * The `title` of the tooltip content
   */
  title?: string;
  /**
   * The `button` below the tooltip content
   */
  button?: React.ReactElement;
}

/**
 * The `TooltipTrigger` props
 */
export interface TooltipTriggerProps extends IWebbComponentBase, RdxTooltipTriggerProps {

}
