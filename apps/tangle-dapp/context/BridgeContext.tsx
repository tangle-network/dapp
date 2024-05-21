'use client';

import { BN } from '@polkadot/util';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  BRIDGE_SUPPORTED_CHAINS,
  BRIDGE_SUPPORTED_TOKENS,
} from '../constants/bridge';
import { BridgeTokenType } from '../types';

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

  selectedToken: BridgeTokenType;
  setSelectedToken: (token: BridgeTokenType) => void;
  tokenOptions: BridgeTokenType[];

  // type
}

const BridgeContext = createContext<BridgeContextProps>({
  selectedSourceChain: BRIDGE_SUPPORTED_CHAINS[0],
  setSelectedSourceChain: () => {
    return;
  },
  sourceChainOptions: BRIDGE_SUPPORTED_CHAINS,

  selectedDestinationChain: BRIDGE_SUPPORTED_CHAINS[1],
  setSelectedDestinationChain: () => {
    return;
  },
  destinationChainOptions: [BRIDGE_SUPPORTED_CHAINS[1]],

  destinationAddress: '',
  setDestinationAddress: () => {
    return;
  },

  amount: null,
  setAmount: () => {
    return;
  },

  selectedToken: BRIDGE_SUPPORTED_TOKENS[0],
  setSelectedToken: () => {
    return;
  },
  tokenOptions: [],
});

export const useBridge = () => {
  return useContext(BridgeContext);
};

const BridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [selectedSourceChain, setSelectedSourceChain] = useState<ChainConfig>(
    BRIDGE_SUPPORTED_CHAINS[0]
  );
  const [selectedDestinationChain, setSelectedDestinationChain] =
    useState<ChainConfig>(BRIDGE_SUPPORTED_CHAINS[1]);

  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState<BN | null>(null);
  const [selectedToken, setSelectedToken] = useState<BridgeTokenType>(
    BRIDGE_SUPPORTED_TOKENS[0]
  );

  const selectedDestinationChainOptions = useMemo(
    () =>
      BRIDGE_SUPPORTED_CHAINS.filter(
        (chain) => chain.id !== selectedSourceChain.id
      ),
    [selectedSourceChain]
  );

  useEffect(() => {
    // If current destination chain is not in the destination chain options,
    // set the first option as the destination chain.
    if (
      !selectedDestinationChainOptions.find(
        (chain) => chain.id === selectedDestinationChain.id
      )
    ) {
      setSelectedDestinationChain(selectedDestinationChainOptions[0]);
    }
  }, [selectedDestinationChainOptions, selectedDestinationChain.id]);

  return (
    <BridgeContext.Provider
      value={{
        selectedSourceChain,
        setSelectedSourceChain,
        sourceChainOptions: BRIDGE_SUPPORTED_CHAINS,

        selectedDestinationChain,
        setSelectedDestinationChain,
        // TODO: add logic to get destination chain options based on source chain
        destinationChainOptions: selectedDestinationChainOptions,

        destinationAddress,
        setDestinationAddress,

        amount,
        setAmount,

        selectedToken,
        setSelectedToken,
        // TODO: add logic to get token options based on source chain
        tokenOptions: BRIDGE_SUPPORTED_TOKENS,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;
