import { ComponentBase } from '../../types';
import { default as CardVariant } from './CardVariant';
export type CardProps = ComponentBase & {
    variant?: CardVariant;
    withShadow?: boolean;
    tightPadding?: boolean;
};
/**
 * Sets up styles, and spacing vertically between `block` components.
 *
 * @example
 *
 * ```jsx
 *  <Card>
 *    ...
 *  </Card>
 *
 * <Card>
 *   <TitleWithInfo title='Token Selector' variant='h4' />
 *
 *   <div className='flex items-center space-x-4'>
 *     <TokenSelector>ETH</TokenSelector>
 *     <TokenSelector>DOT</TokenSelector>
 *     <TokenSelector isActive>KSM</TokenSelector>
 *   </div>
 * </Card>;
 * ```
 */
export declare const Card: import('../../../../../node_modules/react').ForwardRefExoticComponent<ComponentBase & {
    variant?: CardVariant;
    withShadow?: boolean;
    tightPadding?: boolean;
} & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
