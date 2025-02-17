import { TokenSelectorProps } from './types';
/**
 * The TokenSelector component
 *
 * Props:
 * - children: the token symbol to display and render token icon
 * - className: the className to override styling
 * - isDisabled: whether the selector is disabled
 * - isActive: whether the selector is active
 * - tokenType: the token type to display (unshielded or shielded default: unshielded)
 *
 * @example
 * ```jsx
 *  <TokenSelector />
 *  <TokenSelector isDisabled />
 *  <TokenSelector>WETH</TokenSelector>
 * ```
 */
declare const TokenSelector: import('../../../../../node_modules/react').ForwardRefExoticComponent<TokenSelectorProps & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
export default TokenSelector;
