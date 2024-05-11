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

interface BridgeContextProps {
  sourceChain: ChainConfig | null;
  setSourceChain: (chain: ChainConfig) => void;
  destinationChain: ChainConfig | null;
  setDestinationChain: (chain: ChainConfig) => void;
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
  destinationAddress: '',
  setDestinationAddress: () => {
    //
  },
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
        destinationAddress,
        setDestinationAddress,
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
