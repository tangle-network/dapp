import { BN } from '@polkadot/util';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { create } from 'zustand';

import { BRIDGE_CHAINS } from '../../constants/bridge/constants';
import { BridgeTokenType } from '../../types/bridge/types';

const sortChainOptions = (chains: ChainConfig[]) => {
  return chains.sort((a, b) => a.name.localeCompare(b.name));
};

const DEFAULT_SOURCE_CHAINS = sortChainOptions(
  Object.keys(BRIDGE_CHAINS).map(
    (presetTypedChainId) => chainsConfig[+presetTypedChainId],
  ),
);

const DEFAULT_DESTINATION_CHAINS = sortChainOptions(
  Object.keys(BRIDGE_CHAINS[+Object.keys(BRIDGE_CHAINS)[0]]).map(
    (presetTypedChainId) => chainsConfig[+presetTypedChainId],
  ),
);

const getDefaultTokens = (): BridgeTokenType[] => {
  const firstSourceChain = DEFAULT_SOURCE_CHAINS[0];
  const firstSourceChainId = calculateTypedChainId(
    firstSourceChain.chainType,
    firstSourceChain.id,
  );

  const firstDestChain = DEFAULT_DESTINATION_CHAINS[0];
  const firstDestChainId = calculateTypedChainId(
    firstDestChain.chainType,
    firstDestChain.id,
  );

  const bridgeConfig = BRIDGE_CHAINS[firstSourceChainId][firstDestChainId];

  return bridgeConfig.supportedTokens;
};

const DEFAULT_TOKENS = getDefaultTokens();
const DEFAULT_SELECTED_TOKEN = DEFAULT_TOKENS[0] ?? {
  tokenType: 'WETH',
  bridgeType: 'Hyperlane',
  decimals: 18,
};

interface BridgeStore {
  sourceChains: ChainConfig[];
  destinationChains: ChainConfig[];

  selectedSourceChain: ChainConfig;
  selectedDestinationChain: ChainConfig;

  setSelectedSourceChain: (chain: ChainConfig) => void;
  setSelectedDestinationChain: (chain: ChainConfig) => void;

  tokens: BridgeTokenType[];
  setTokens: (tokens: BridgeTokenType[]) => void;

  selectedToken: BridgeTokenType;
  setSelectedToken: (token: BridgeTokenType) => void;

  amount: BN | null;
  setAmount: (amount: BN | null) => void;

  isAmountInputError: boolean;
  setIsAmountInputError: (isAmountInputError: boolean) => void;
}

const useBridgeStore = create<BridgeStore>((set) => ({
  sourceChains: DEFAULT_SOURCE_CHAINS,
  destinationChains: DEFAULT_DESTINATION_CHAINS,

  selectedSourceChain: DEFAULT_SOURCE_CHAINS[0],
  selectedDestinationChain: DEFAULT_DESTINATION_CHAINS[0],

  setSelectedSourceChain: (chain) =>
    set(() => {
      const availableDestinations = sortChainOptions(
        Object.keys(
          BRIDGE_CHAINS[calculateTypedChainId(chain.chainType, chain.id)],
        ).map((presetTypedChainId) => chainsConfig[+presetTypedChainId]),
      );

      return {
        selectedSourceChain: chain,
        destinationChains: availableDestinations,
        selectedDestinationChain: availableDestinations[0],
      };
    }),
  setSelectedDestinationChain: (chain) =>
    set({ selectedDestinationChain: chain }),

  tokens: DEFAULT_TOKENS,
  setTokens: (tokens) => set({ tokens }),

  selectedToken: DEFAULT_SELECTED_TOKEN,
  setSelectedToken: (token) => set({ selectedToken: token }),

  amount: null,
  setAmount: (amount) => set({ amount }),

  isAmountInputError: false,
  setIsAmountInputError: (isAmountInputError) => set({ isAmountInputError }),
}));

export default useBridgeStore;
