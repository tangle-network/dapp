import { PresetTypedChainId } from '@webb-tools/dapp-types/ChainId';

/**
 * The duration for which the bond is locked.
 * @see https://github.com/webb-tools/tangle/blob/d566921714d0005dd0aebee3b0b5267962759098/pallets/multi-asset-delegation/src/lib.rs#L97
 **/
export const BOND_DURATION = 10;

/**
 * The supported restake deposit typed chain ids.
 */
export const SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS = [
  PresetTypedChainId.TangleLocalEVM,
] as const;
