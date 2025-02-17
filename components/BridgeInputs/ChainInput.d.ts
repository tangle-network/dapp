import { ChainInputComponentProps } from './types';
/**
 * The `ChainInput` component
 *
 * Props:
 *
 * - `chain`: Will display `select chain` when the chain not provided
 * - `chainType`:  Input "source" | "dest"
 *
 * @example
 *
 * ```jsx
 * <ChainInput />
 * <ChainInput chainType='dest' chain={{ name: 'Optimism', symbol: 'op' }} />
 * ```
 */
export declare const ChainInput: import('../../../../../node_modules/react').ForwardRefExoticComponent<ChainInputComponentProps & import('../../../../../node_modules/react').RefAttributes<HTMLDivElement>>;
