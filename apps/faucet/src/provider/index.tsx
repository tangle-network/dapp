import NextThemeProvider from '@webb-tools/api-provider-environment/NextThemeProvider';
import { chainsConfig } from '@webb-tools/dapp-config/chains/chain-config';
import { ChainType } from '@webb-tools/sdk-core/typed-chain-id';
import { createContext, FC, PropsWithChildren, useContext } from 'react';
import { BehaviorSubject } from 'rxjs';

import tokens from '../config/tokens';
import { AddressType, FaucetChainDataType, MintTokenResult } from '../types';

/**
 * An object to hold the all input values for the faucet form
 */
export type InputValuesType = {
  /**
   * Current selected typed chain id
   */
  chain?: number;

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

  /**
   * Boolean to check if the recipient address is valid or not
   */
  isValidRecipientAddress?: boolean;
};

/**
 * The FaucetContext type
 */
export type FaucetContextType = {
  /**
   * The default amount to send
   */
  amount$: BehaviorSubject<number>;

  /**
   * The faucet config contains the supported chains and tokens
   * (typed chain id -> supported token symbol -> contract address)
   */
  config: { [typedChainId: number]: FaucetChainDataType };

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

  /**
   * The mint token result observable
   */
  mintTokenResult$: BehaviorSubject<MintTokenResult | null>;
};

// Serialize the tokens config to the FaucetChainDataType
const config = Object.entries(tokens).reduce(
  (acc, [typedChainIdStr, tokensRecord]) => {
    const typedChainId = +typedChainIdStr;
    const chain = chainsConfig[+typedChainId];

    if (!chain) {
      alert(`Typed chain id ${typedChainId} is not in the chains config`);
      return acc;
    }

    acc[typedChainId] = {
      chainId: chain.id,
      name: chain.name,
      tokenAddresses: tokensRecord,
      type: chain.chainType === ChainType.Substrate ? 'Substrate' : 'Evm',
    } as const satisfies FaucetChainDataType;

    return acc;
  },
  {} as Record<number, FaucetChainDataType>,
);

const defaultContextValue = {
  amount$: new BehaviorSubject(NaN),
  config,
  inputValues$: new BehaviorSubject<InputValuesType>({}),
  isMintingModalOpen$: new BehaviorSubject<boolean>(false),
  isMintingSuccess$: new BehaviorSubject<boolean>(false),
  mintTokenResult$: new BehaviorSubject<MintTokenResult | null>(null),
} satisfies FaucetContextType;

const FaucetContext = createContext<FaucetContextType>(defaultContextValue);

const Provider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <FaucetContext.Provider value={defaultContextValue}>
      <NextThemeProvider>{children}</NextThemeProvider>
    </FaucetContext.Provider>
  );
};

export const useFaucetContext = () => useContext(FaucetContext);

export default Provider;
