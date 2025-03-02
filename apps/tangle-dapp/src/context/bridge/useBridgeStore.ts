import { BN } from '@polkadot/util';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import { ChainConfig } from '@tangle-network/dapp-config/chains/chain-config.interface';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import { Decimal } from 'decimal.js';
import get from 'lodash/get';
import { create } from 'zustand';

import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { BRIDGE_CHAINS } from '@tangle-network/tangle-shared-ui/constants/bridge';

const sortChainOptions = (chains: ChainConfig[]) => {
  return chains.sort((a, b) => a.name.localeCompare(b.name));
};

const DEFAULT_SOURCE_CHAINS = sortChainOptions(
  Object.keys(BRIDGE_CHAINS).map((presetTypedChainId) =>
    get(chainsConfig, presetTypedChainId),
  ),
);

const DEFAULT_DESTINATION_CHAINS = sortChainOptions(
  Object.keys(get(BRIDGE_CHAINS, [Object.keys(BRIDGE_CHAINS)[0]], {})).map(
    (presetTypedChainId) => get(chainsConfig, presetTypedChainId),
  ),
);

const getDefaultTokens = (): BridgeToken[] => {
  const firstSourceChain = get(chainsConfig, PresetTypedChainId.Arbitrum);

  const firstSourceChainId = calculateTypedChainId(
    firstSourceChain.chainType,
    firstSourceChain.id,
  );

  const firstDestChain = get(chainsConfig, PresetTypedChainId.TangleMainnetEVM);

  const firstDestChainId = calculateTypedChainId(
    firstDestChain.chainType,
    firstDestChain.id,
  );

  return get(BRIDGE_CHAINS, [firstSourceChainId, firstDestChainId, 'supportedTokens'], []);
};

const DEFAULT_TOKENS = getDefaultTokens();
const DEFAULT_SELECTED_TOKEN =
  DEFAULT_TOKENS.length > 0 ? DEFAULT_TOKENS[0] : null;

interface BridgeStore {
  sourceChains: ChainConfig[];
  selectedSourceChain: ChainConfig;
  setSelectedSourceChain: (chain: ChainConfig) => void;

  destinationChains: ChainConfig[];
  selectedDestinationChain: ChainConfig;
  setSelectedDestinationChain: (chain: ChainConfig) => void;

  tokens: BridgeToken[];
  setTokens: (tokens: BridgeToken[]) => void;

  selectedToken: BridgeToken | null;
  setSelectedToken: (token: BridgeToken | null) => void;

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

  mainnetSourceChains: ChainConfig[];
  testnetSourceChains: ChainConfig[];
}

const useBridgeStore = create<BridgeStore>((set) => ({
  sourceChains: DEFAULT_SOURCE_CHAINS,
  destinationChains: DEFAULT_DESTINATION_CHAINS,

  selectedSourceChain: get(chainsConfig, PresetTypedChainId.Arbitrum),
  selectedDestinationChain: get(
    chainsConfig,
    PresetTypedChainId.TangleMainnetEVM,
  ),

  setSelectedSourceChain: (chain) =>
    set((_state) => {
      const sourceTypedChainId = calculateTypedChainId(
        chain.chainType,
        chain.id,
      );

      const availableDestinations = sortChainOptions(
        Object.keys(get(BRIDGE_CHAINS, [sourceTypedChainId], {})).map(
          (presetTypedChainId) => get(chainsConfig, presetTypedChainId),
        ),
      );

      if (availableDestinations.length === 0) {
        const defaultSource = get(chainsConfig, PresetTypedChainId.Arbitrum);
        const defaultDestination = get(
          chainsConfig,
          PresetTypedChainId.TangleMainnetEVM,
        );

        return {
          selectedSourceChain: { ...defaultSource },
          destinationChains: [defaultDestination],
          selectedDestinationChain: { ...defaultDestination },
          tokens: DEFAULT_TOKENS,
          selectedToken:
            DEFAULT_TOKENS.length > 0 ? { ...DEFAULT_TOKENS[0] } : null,
        };
      }

      const destinationTypedChainId = calculateTypedChainId(
        availableDestinations[0].chainType,
        availableDestinations[0].id,
      );

      const tokens =
        get(BRIDGE_CHAINS, [sourceTypedChainId, destinationTypedChainId, 'supportedTokens'], []);

      return {
        selectedSourceChain: { ...chain },
        destinationChains: [...availableDestinations],
        selectedDestinationChain: { ...availableDestinations[0] },
        tokens: [...tokens],
        selectedToken: tokens.length > 0 ? { ...tokens[0] } : null,
      };
    }),
  setSelectedDestinationChain: (chain) =>
    set((state) => {
      const sourceTypedChainId = calculateTypedChainId(
        state.selectedSourceChain.chainType,
        state.selectedSourceChain.id,
      );
      const destinationTypedChainId = calculateTypedChainId(chain.chainType, chain.id);
      const tokens = get(BRIDGE_CHAINS, [sourceTypedChainId, destinationTypedChainId, 'supportedTokens'], []);

      return {
        selectedDestinationChain: chain,
        tokens,
        selectedToken: tokens.length > 0 ? tokens[0] : null,
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

  mainnetSourceChains: DEFAULT_SOURCE_CHAINS.filter(
    (chain) => chain.tag === 'live',
  ),
  testnetSourceChains: DEFAULT_SOURCE_CHAINS.filter(
    (chain) => chain.tag === 'test',
  ),
}));

export default useBridgeStore;
