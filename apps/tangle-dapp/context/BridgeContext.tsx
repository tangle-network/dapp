'use client';

import { BN } from '@polkadot/util';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

import { BRIDGE_SUPPORTED_CHAINS } from '../constants/bridge';

interface BridgeContextProps {
  sourceChain: ChainConfig | null;
  setSourceChain: (chain: ChainConfig | null) => void;
  supportedSourceChains: ChainConfig[];
  destinationChain: ChainConfig | null;
  setDestinationChain: (chain: ChainConfig | null) => void;
  supportedDestinationChains: ChainConfig[];
  destinationAddress: string;
  setDestinationAddress: (address: string) => void;
  amount: BN | null;
  setAmount: (amount: BN | null) => void;
  isLoading: boolean;
}

const BridgeContext = createContext<BridgeContextProps>({
  sourceChain: null,
  setSourceChain: () => {
    //
  },
  destinationChain: null,
  setDestinationChain: () => {
    //
  },
  supportedSourceChains: [],
  destinationAddress: '',
  setDestinationAddress: () => {
    //
  },
  supportedDestinationChains: [],
  amount: null,
  setAmount: () => {
    //
  },
  isLoading: false,
});

export const useBridge = () => {
  return useContext(BridgeContext);
};

const BridgeProvider: FC<PropsWithChildren> = ({ children }) => {
  const { loading: isLoading } = useWebContext();

  const [sourceChain, setSourceChain] = useState<ChainConfig | null>(null);
  const [destinationChain, setDestinationChain] = useState<ChainConfig | null>(
    null
  );
  const [destinationAddress, setDestinationAddress] = useState<string>('');
  const [amount, setAmount] = useState<BN | null>(null);

  return (
    <BridgeContext.Provider
      value={{
        sourceChain,
        setSourceChain,
        destinationChain,
        setDestinationChain,
        supportedSourceChains: BRIDGE_SUPPORTED_CHAINS,
        destinationAddress,
        setDestinationAddress,
        supportedDestinationChains: BRIDGE_SUPPORTED_CHAINS,
        amount,
        setAmount,
        isLoading,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export default BridgeProvider;
