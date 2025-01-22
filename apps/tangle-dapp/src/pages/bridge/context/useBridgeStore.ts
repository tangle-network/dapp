import { BN } from '@polkadot/util';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import { Decimal } from 'decimal.js';
import { create } from 'zustand';

import { BridgeToken } from '@webb-tools/tangle-shared-ui/types';
import { BRIDGE_CHAINS } from '../constants';

const sortChainOptions = (chains: ChainConfig[]) => {
  return chains.sort((a, b) => a.name.localeCompare(b.name));
};

const DEFAULT_SOURCE_CHAINS = sortChainOptions(
  Object.keys(BRIDGE_CHAINS).map(
    (presetTypedChainId) => chainsConfig[+presetTypedChainId],
  ),
);

const DEFAULT_DESTINATION_CHAINS = sortChainOptions(
  Object.keys(BRIDGE_CHAINS[Number(Object.keys(BRIDGE_CHAINS)[0])]).map(
    (presetTypedChainId) => chainsConfig[Number(presetTypedChainId)],
  ),
);

const getDefaultTokens = (): BridgeToken[] => {
  const firstSourceChain = chainsConfig[PresetTypedChainId.Arbitrum];

  const firstSourceChainId = calculateTypedChainId(
    firstSourceChain.chainType,
    firstSourceChain.id,
  );

  const firstDestChain = chainsConfig[PresetTypedChainId.TangleMainnetEVM];

  const firstDestChainId = calculateTypedChainId(
    firstDestChain.chainType,
    firstDestChain.id,
  );

  const bridgeConfig = BRIDGE_CHAINS[firstSourceChainId][firstDestChainId];

  return bridgeConfig.supportedTokens;
};

const DEFAULT_TOKENS = getDefaultTokens();
const DEFAULT_SELECTED_TOKEN = DEFAULT_TOKENS[0];

interface BridgeStore {
  sourceChains: ChainConfig[];
  destinationChains: ChainConfig[];

  selectedSourceChain: ChainConfig;
  selectedDestinationChain: ChainConfig;

  setSelectedSourceChain: (chain: ChainConfig) => void;
  setSelectedDestinationChain: (chain: ChainConfig) => void;

  tokens: BridgeToken[];
  setTokens: (tokens: BridgeToken[]) => void;

  selectedToken: BridgeToken;
  setSelectedToken: (token: BridgeToken) => void;

  amount: BN | null;
  setAmount: (amount: BN | null) => void;

  isAmountInputError: boolean;
  setIsAmountInputError: (
    isAmountInputError: boolean,
    errorMessage: string | null,
  ) => void;
  amountInputErrorMessage: string | null;

  destinationAddress: string | null;
  setDestinationAddress: (destinationAddress: string | null) => void;

  isAddressInputError: boolean;
  setIsAddressInputError: (isAddressInputError: boolean) => void;

  sendingAmount: Decimal | null;
  setSendingAmount: (sendingAmount: Decimal | null) => void;

  receivingAmount: Decimal | null;
  setReceivingAmount: (receivingAmount: Decimal | null) => void;
}

const useBridgeStore = create<BridgeStore>((set) => ({
  sourceChains: DEFAULT_SOURCE_CHAINS,
  destinationChains: DEFAULT_DESTINATION_CHAINS,

  selectedSourceChain: chainsConfig[PresetTypedChainId.Arbitrum],
  selectedDestinationChain: chainsConfig[PresetTypedChainId.TangleMainnetEVM],

  setSelectedSourceChain: (chain) =>
    set(() => {
      const availableDestinations = sortChainOptions(
        Object.keys(
          BRIDGE_CHAINS[calculateTypedChainId(chain.chainType, chain.id)],
        ).map((presetTypedChainId) => chainsConfig[+presetTypedChainId]),
      );

      const tokens =
        BRIDGE_CHAINS[calculateTypedChainId(chain.chainType, chain.id)][
          calculateTypedChainId(
            availableDestinations[0].chainType,
            availableDestinations[0].id,
          )
        ].supportedTokens;

      return {
        selectedSourceChain: chain,
        destinationChains: availableDestinations,
        selectedDestinationChain: availableDestinations[0],
        tokens,
        selectedToken: tokens[0],
      };
    }),
  setSelectedDestinationChain: (chain) =>
    set((state) => {
      const tokens =
        BRIDGE_CHAINS[
          calculateTypedChainId(
            state.selectedSourceChain.chainType,
            state.selectedSourceChain.id,
          )
        ][calculateTypedChainId(chain.chainType, chain.id)].supportedTokens;

      return {
        selectedDestinationChain: chain,
        tokens,
        selectedToken: tokens[0],
      };
    }),

  tokens: DEFAULT_TOKENS,
  setTokens: (tokens) => set({ tokens }),

  selectedToken: DEFAULT_SELECTED_TOKEN,
  setSelectedToken: (token) => set({ selectedToken: token }),

  amount: null,
  setAmount: (amount) => set({ amount }),

  isAmountInputError: false,
  setIsAmountInputError: (isAmountInputError, errorMessage) =>
    set({ isAmountInputError, amountInputErrorMessage: errorMessage }),
  amountInputErrorMessage: null,

  destinationAddress: null,
  setDestinationAddress: (destinationAddress) => set({ destinationAddress }),

  isAddressInputError: false,
  setIsAddressInputError: (isAddressInputError) => set({ isAddressInputError }),

  sendingAmount: null,
  setSendingAmount: (sendingAmount) => set({ sendingAmount }),

  receivingAmount: null,
  setReceivingAmount: (receivingAmount) => set({ receivingAmount }),
}));

export default useBridgeStore;
