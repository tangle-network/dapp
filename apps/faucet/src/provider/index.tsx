import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { createContext, FC, PropsWithChildren, useContext } from 'react';
import { BehaviorSubject } from 'rxjs';

import tokens from '../config/tokens';
import { AddressType, FaucetChainDataType } from '../types';

/**
 * An object to hold the all input values for the faucet form
 */
export type InputValuesType = {
  /**
   * Current selected chain name
   */
  chain?: string;

  /**
   * Current selected token symbol
   */
  token?: string;

  /**
   * Current selected token contract address
   */
  contractAddress?: string;

  /**
   * Recipient address
   */
  recepient?: string;

  /**
   * The recipient address type
   */
  recepientAddressType?: AddressType;
};

/**
 * The FaucetContext type
 */
export type FaucetContextType = {
  /**
   * The default amount to send
   */
  amount: number;

  /**
   * The faucet config contains the supported chains and tokens
   * (chain name -> supported token symbol -> contract address)
   */
  config: Record<string, FaucetChainDataType>;

  /**
   * The observer to hold the all input values for the faucet form
   */
  inputValues$: BehaviorSubject<InputValuesType>;

  /**
   * Boolean to show the minting process modal
   */
  isMintingModalOpen$: BehaviorSubject<boolean>;

  /**
   * Boolean to show the minting success modal
   */
  isMintingSuccess$: BehaviorSubject<boolean>;
};

// The default amount to send
const AMOUNT = 1000;

// Serialize the tokens config to the FaucetChainDataType
const config = Object.entries(tokens).reduce(
  (acc, [typedChainId, tokensRecord]) => {
    const chain = chainsConfig[+typedChainId];

    if (!chain) {
      console.error(
        `Typed chain id ${typedChainId} is not in the chains config`
      );
      return acc;
    }

    acc[chain.name] = {
      chainId: chain.chainId,
      name: chain.name,
      tokenAddresses: tokensRecord,
      type: chain.chainType === ChainType.Substrate ? 'Substrate' : 'Evm',
    } as const satisfies FaucetChainDataType;

    return acc;
  },
  {} as Record<string, FaucetChainDataType>
);

const defaultContextValue = {
  amount: AMOUNT,
  config,
  inputValues$: new BehaviorSubject<InputValuesType>({}),
  isMintingModalOpen$: new BehaviorSubject<boolean>(false),
  isMintingSuccess$: new BehaviorSubject<boolean>(false),
};

const FaucetContext = createContext<FaucetContextType>(defaultContextValue);

const Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <FaucetContext.Provider value={defaultContextValue}>
      <WebbUIProvider defaultThemeMode="light">{children}</WebbUIProvider>
    </FaucetContext.Provider>
  );
};

export const useFaucetContext = () => useContext(FaucetContext);

export default Provider;
