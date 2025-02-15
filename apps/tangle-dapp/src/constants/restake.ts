import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';

export const SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS = [
  PresetTypedChainId.TangleTestnetNative,
  PresetTypedChainId.TangleTestnetEVM,
  PresetTypedChainId.TangleLocalNative,
  PresetTypedChainId.TangleLocalEVM,
] as const;
