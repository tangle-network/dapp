import { TooltipBodyProps, TooltipProps, TooltipTriggerProps } from './types';
/**
 * The `ToolTipBody` component, use after the `TooltipTrigger`.
 * Represents the popup content of the tooltip.
 * Must use inside the `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <ToolTipBody className='max-w-[185px] w-auto'>
 *      <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
 *    </ToolTipBody>
 * ```
 */
export declare const TooltipBody: React.FC<TooltipBodyProps>;
/**
 * The `TooltipTrigger` component, wrap around a trigger component like `Button` or `Chip` or a html tag.
 * Must use inside the `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <ToolTipTrigger>
 *      <Chip color='blue'>Text only</Chip>
 *    </ToolTipTrigger>
 * ```
 */
export declare const TooltipTrigger: React.FC<TooltipTriggerProps>;
/**
 * The `Tooltip` component.
 *
 * @example
 *
 * ```jsx
 *    <Tooltip isDefaultOpen>
 *      <ToolTipTrigger>
 *        <Chip color='blue'>Text only</Chip>
 *      </ToolTipTrigger>
 *      <ToolTipBody className='max-w-[185px] w-auto'>
 *        <span>A report of a DKG authority misbehaving. (Body xs Regular)</span>
 *      </ToolTipBody>
 *    </Tooltip>
 * ```
 */
export declare const Tooltip: React.FC<TooltipProps>;
