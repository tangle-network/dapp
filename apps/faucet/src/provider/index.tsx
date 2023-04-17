import EVMChainId from '@webb-tools/dapp-types/EVMChainId';
import SubstrateChainId from '@webb-tools/dapp-types/SubstrateChainId';
import { WebbUIProvider } from '@webb-tools/webb-ui-components';
import { createContext, FC, PropsWithChildren, useContext } from 'react';
import { BehaviorSubject } from 'rxjs';

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
  recepientAddressType?: 'ethereum' | 'substrate';
};

/**
 * The chain data type
 */
export type FaucetChainDataType = {
  /**
   * The chain name (used for display and render the `ChainIcon`)
   */
  name: string;

  /**
   * The chain type (Evm or Substrate)
   */
  type: 'Evm' | 'Substrate';

  /**
   * The chain id
   */
  chainId: number;

  /**
   * The token address record
   * (token symbol -> contract address)
   */
  tokenAddresses: Record<string, string>;
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

// Note: This is a placeholder for now
const config: Record<string, FaucetChainDataType> = {
  Arbitrum: {
    chainId: EVMChainId.ArbitrumTestnet,
    name: 'Arbitrum',
    tokenAddresses: {
      webbtTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    },
    type: 'Evm',
  },
  Goerli: {
    chainId: EVMChainId.Goerli,
    name: 'Goerli',
    tokenAddresses: {
      webbtTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    },
    type: 'Evm',
  },
  Tangle: {
    chainId: SubstrateChainId.ProtocolSubstrateStandalone,
    name: 'Tangle',
    tokenAddresses: {
      tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    },
    type: 'Substrate',
  },
};

// The default amount to send
const AMOUNT = 1000;

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
