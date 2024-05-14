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

import { BRIDGE_SUPPORTED_CHAINS } from '../constants/bridge';

interface BridgeContextProps {
  sourceChain: ChainConfig;
  setSourceChain: (chain: ChainConfig) => void;
  sourceChainOptions: ChainConfig[];
  destinationChain: ChainConfig;
  setDestinationChain: (chain: ChainConfig) => void;
  destinationChainOptions: ChainConfig[];
  destinationAddress: string;
  setDestinationAddress: (address: string) => void;
  amount: BN | null;
  setAmount: (amount: BN | null) => void;
}

const BridgeContext = createContext<BridgeContextProps>({
  sourceChain: BRIDGE_SUPPORTED_CHAINS[0],
  setSourceChain: () => {
    return;
  },
  destinationChain: BRIDGE_SUPPORTED_CHAINS[1],
  setDestinationChain: () => {
    return;
  },
  sourceChainOptions: [],
  destinationAddress: '',
  setDestinationAddress: () => {
    return;
  },
  destinationChainOptions: [],
  amount: null,
  setAmount: () => {
    return;
  },
});

export const useBridge = () => {
  return useContext(BridgeContext);
};

const BridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const [sourceChain, setSourceChain] = useState<ChainConfig>(
    BRIDGE_SUPPORTED_CHAINS[0]
  );
  const [destinationChain, setDestinationChain] = useState<ChainConfig>(
    BRIDGE_SUPPORTED_CHAINS[1]
  );
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState<BN | null>(null);

  const destinationChainOptions = useMemo(
    () =>
      BRIDGE_SUPPORTED_CHAINS.filter((chain) => chain.id !== sourceChain.id),
    [sourceChain]
  );

  useEffect(() => {
    // If current destination chain is not in the destination chain options,
    // set the first option as the destination chain.
    if (
      !destinationChainOptions.find((chain) => chain.id === destinationChain.id)
    ) {
      setDestinationChain(destinationChainOptions[0]);
    }
  }, [destinationChainOptions, destinationChain.id]);

  return (
    <BridgeContext.Provider
      value={{
        sourceChain,
        setSourceChain,
        destinationChain: destinationChainOptions[0],
        setDestinationChain,
        // TODO: add logic to get supported chains for the bridge
        sourceChainOptions: BRIDGE_SUPPORTED_CHAINS,
        destinationAddress,
        setDestinationAddress,
        // TODO: add logic to get supported chains for the bridge
        destinationChainOptions,
        amount,
        setAmount,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;
