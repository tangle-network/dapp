import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';

export const SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS = [
  PresetTypedChainId.TangleMainnetNative,
  PresetTypedChainId.TangleMainnetEVM,
  PresetTypedChainId.TangleTestnetNative,
  PresetTypedChainId.TangleTestnetEVM,
  PresetTypedChainId.TangleLocalNative,
  PresetTypedChainId.TangleLocalEVM,
  // Local dev chain (Foundry Anvil, chainId 31337) used by scripts/local-env/start-local-env.sh
  PresetTypedChainId.AnvilLocal,
] as const;
