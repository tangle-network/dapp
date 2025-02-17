import { ChainListCardProps } from './types';
/**
 * The ChainListCard component is used to display a list of chains.
 *
 * Props:
 * - `chains`: The list of chains to display.
 * - `chainType`: The type of chain to display.
 * - `currentActiveChain`: The current active chain.
 * - `defaultCategory`: The default category to display.
 * - `onChange`: The callback function when the chain is changed.
 * - `onClose`: The callback function when the card is closed.
 * - `onlyCategory`: The category to display.
 * - `overrideScrollAreaProps`: The props to override the scroll area.
 * - `isConnectingToChain`: Whether the chain is connecting.
 * - `value`: The selected chain.
 *
 * @example
 * ```tsx
 * <ChainListCard
 *  chains={chains}
 *  chainType="source"
 *  currentActiveChain={currentActiveChain}
 *  defaultCategory="test"
 *  onChange={setSourceChain}
 *  onClose={() => setShowSourceChainList(false)}
 *  onlyCategory="test"
 * />
 * ```
 */
declare const ChainListCard: import('../../../../../node_modules/react').ForwardRefExoticComponent<ChainListCardProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
export default ChainListCard;
