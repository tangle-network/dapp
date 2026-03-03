import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import type { ChainConfig } from '@tangle-network/dapp-config';

const SUPPORTED_EVM_STAKING_TYPED_CHAIN_IDS = [
  PresetTypedChainId.BaseSepolia,
  // Local dev chain (Foundry Anvil, chainId 31337) used by scripts/local-env/start-local-env.sh
  PresetTypedChainId.AnvilLocal,
] as const;

export const SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS =
  SUPPORTED_EVM_STAKING_TYPED_CHAIN_IDS;

type SupportedStakingChain = ChainConfig & {
  typedChainId: (typeof SUPPORTED_EVM_STAKING_TYPED_CHAIN_IDS)[number];
};

const isDefined = <T>(value: T | undefined): value is T => value !== undefined;

export const SUPPORTED_STAKING_DEPOSIT_CHAINS = [
  ...SUPPORTED_EVM_STAKING_TYPED_CHAIN_IDS.map((typedChainId) => {
    const chainConfig = chainsConfig[typedChainId];

    if (chainConfig === undefined) {
      return undefined;
    }

    return {
      ...chainConfig,
      typedChainId,
    } satisfies SupportedStakingChain;
  }),
].filter(isDefined);

export const SUPPORTED_STAKING_DEPOSIT_CHAIN_IDS =
  SUPPORTED_STAKING_DEPOSIT_CHAINS.map((chain) => chain.id);
