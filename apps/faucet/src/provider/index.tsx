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
   * The observer to hold the all input values for the faucet form
   */
  inputValues$: BehaviorSubject<InputValuesType>;

  /**
   * Current twitter handle observer (use for auth checking)
   * empty string if not logged in
   */
  twitterHandle$: BehaviorSubject<string>;
};

const defaultContextValue = {
  inputValues$: new BehaviorSubject<InputValuesType>({}),
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
