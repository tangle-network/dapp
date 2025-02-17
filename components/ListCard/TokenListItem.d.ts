import { AssetType } from './types';
/**
 * TokenListItem component
 *
 * Props:
 * - name: the name of the token
 * - symbol: the symbol of the token
 * - balance: the balance of the token
 * - onAddToken: callback when user hit the add token button
 *
 * @example
 * ```tsx
 * <TokenListItem name="Ethereum" symbol="ETH" />
 * ```
 */
declare const TokenListItem: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<AssetType & Omit<Omit<import('../../../../../node_modules/react').DetailedHTMLProps<import('../../../../../node_modules/react').LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>, "ref">, "disabled"> & {
    isDisabled?: boolean;
} & import('../../../../../node_modules/react').RefAttributes<HTMLLIElement>, "ref"> & import('../../../../../node_modules/react').RefAttributes<HTMLLIElement>>;
export default TokenListItem;
