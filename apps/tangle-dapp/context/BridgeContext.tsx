'use client';

import { BN } from '@polkadot/util';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import assert from 'assert';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { BRIDGE } from '../constants/bridge';
import { BridgeTokenId } from '../types/bridge';

const BRIDGE_SOURCE_CHAIN_OPTIONS = Object.keys(BRIDGE).map(
  (presetTypedChainId) => chainsConfig[+presetTypedChainId]
);

const DEFAULT_DESTINATION_CHAIN_OPTIONS = Object.keys(
  BRIDGE_SOURCE_CHAIN_OPTIONS[0]
).map((presetTypedChainId) => chainsConfig[+presetTypedChainId]);

const DEFAULT_TOKEN_OPTIONS = Object.values(Object.values(BRIDGE)[0])[0]
  .supportedTokens;

interface BridgeContextProps {
  selectedSourceChain: ChainConfig;
  setSelectedSourceChain: (chain: ChainConfig) => void;
  sourceChainOptions: ChainConfig[];

  selectedDestinationChain: ChainConfig;
  setSelectedDestinationChain: (chain: ChainConfig) => void;
  destinationChainOptions: ChainConfig[];

  destinationAddress: string;
  setDestinationAddress: (address: string) => void;

  amount: BN | null;
  setAmount: (amount: BN | null) => void;

  selectedTokenId: BridgeTokenId;
  setSelectedTokenId: (token: BridgeTokenId) => void;
  tokenIdOptions: BridgeTokenId[];
}

const BridgeContext = createContext<BridgeContextProps>({
  selectedSourceChain: BRIDGE_SOURCE_CHAIN_OPTIONS[0],
  setSelectedSourceChain: () => {
    return;
  },
  sourceChainOptions: BRIDGE_SOURCE_CHAIN_OPTIONS,

  selectedDestinationChain: DEFAULT_DESTINATION_CHAIN_OPTIONS[0],
  setSelectedDestinationChain: () => {
    return;
  },
  destinationChainOptions: DEFAULT_DESTINATION_CHAIN_OPTIONS,

  destinationAddress: '',
  setDestinationAddress: () => {
    return;
  },

  amount: null,
  setAmount: () => {
    return;
  },

  selectedTokenId: DEFAULT_TOKEN_OPTIONS[0],
  setSelectedTokenId: () => {
    return;
  },
  tokenIdOptions: DEFAULT_TOKEN_OPTIONS,
});

export const useBridge = () => {
  return useContext(BridgeContext);
};

const BridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedSourceChain, setSelectedSourceChain] = useState<ChainConfig>(
    BRIDGE_SOURCE_CHAIN_OPTIONS[0]
  );

  const selectedSourcePresetTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedSourceChain.chainType,
        selectedSourceChain.id
      ),
    [selectedSourceChain.chainType, selectedSourceChain.id]
  );

  const destinationChainOptions = useMemo(
    () =>
      Object.keys(BRIDGE[selectedSourcePresetTypedChainId]).map(
        (presetTypedChainId) => chainsConfig[+presetTypedChainId]
      ),
    [selectedSourcePresetTypedChainId]
  );

  assert(destinationChainOptions.length > 0, 'No destination chain options');

  const [selectedDestinationChain, setSelectedDestinationChain] =
    useState<ChainConfig>(destinationChainOptions[0]);

  const selectedDestinationPresetTypedChainId = useMemo(
    () =>
      calculateTypedChainId(
        selectedDestinationChain.chainType,
        selectedDestinationChain.id
      ),
    [selectedDestinationChain.chainType, selectedDestinationChain.id]
  );

  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState<BN | null>(null);

  const tokenIdOptions = useMemo(
    () =>
      BRIDGE[selectedSourcePresetTypedChainId][
        selectedDestinationPresetTypedChainId
      ]?.supportedTokens ??
      Object.values(BRIDGE[selectedSourcePresetTypedChainId])[0]
        .supportedTokens,
    [selectedSourcePresetTypedChainId, selectedDestinationPresetTypedChainId]
  );

  const [selectedTokenId, setSelectedTokenId] = useState<BridgeTokenId>(
    tokenIdOptions[0]
  );

  useEffect(() => {
    // If current destination chain is not in the destination chain options,
    // set the first option as the destination chain.
    if (
      !destinationChainOptions.find(
        (chain) =>
          calculateTypedChainId(chain.chainType, chain.id) ===
          calculateTypedChainId(
            selectedDestinationChain.chainType,
            selectedDestinationChain.id
          )
      )
    ) {
      setSelectedDestinationChain(destinationChainOptions[0]);
    }
  }, [
    destinationChainOptions,
    selectedDestinationChain.id,
    selectedDestinationChain.chainType,
  ]);

  useEffect(() => {
    // If current token is not in the token options, set the first option as the token.
    if (!tokenIdOptions.find((tokenId) => tokenId === selectedTokenId)) {
      setSelectedTokenId(tokenIdOptions[0]);
    }
  }, [selectedTokenId, tokenIdOptions]);

  return (
    <BridgeContext.Provider
      value={{
        selectedSourceChain,
        setSelectedSourceChain,
        sourceChainOptions: BRIDGE_SOURCE_CHAIN_OPTIONS,

        selectedDestinationChain,
        setSelectedDestinationChain,
        destinationChainOptions,

        destinationAddress,
        setDestinationAddress,

        amount,
        setAmount,

        selectedTokenId,
        setSelectedTokenId,
        tokenIdOptions,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;
