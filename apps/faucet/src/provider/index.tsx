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
  config: Record<string, Record<string, string>>;

  /**
   * The observer to hold the all input values for the faucet form
   */
  inputValues$: BehaviorSubject<InputValuesType>;

  /**
   * Current twitter handle observer (use for auth checking)
   * empty string if not logged in
   */
  twitterHandle$: BehaviorSubject<string>;

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
// chain name -> supported token symbol -> contract address
const config: Record<string, Record<string, string>> = {
  'Moonbase Alpha': {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  arbitrum: {
    wTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  goerli: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
    webbtTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  mumbai: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  optimism: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
  },
  sepolia: {
    tTNT: '0x32307adfFE088e383AFAa721b06436aDaBA47DBE',
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
  twitterHandle$: new BehaviorSubject<string>(''),
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
