import { ChainChipProps } from './types';
/**
 * `ChainChip` component
 *
 * Props:
 *
 * - `type`: `ChainType` -
 * polygon
  | ethereum
  | optimism
  | kusama
  | moonbeam
  | polkadot
  | arbitrum
  | avalanche
  | tangle
  | cosmos
  | scroll
  | webb-dev
 * - `name`: `string` -
 * Chain name to display. e.g. Ethereum, Polygon, Kusama, Optimism Goerli etc.
 * @example
 *
 * ```jsx
 *  <ChainChip type="optimism" name="optimism goerli" />
 *  <ChainChip type="moonbeam" name="moonbeam alpha" />
 * ```
 */
export declare const ChainChip: import('../../../../../node_modules/react').ForwardRefExoticComponent<ChainChipProps & import('../../../../../node_modules/react').RefAttributes<HTMLSpanElement>>;
