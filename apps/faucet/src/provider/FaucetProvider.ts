import { createContext } from 'react';

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
   * The object to hold the all input values for the faucet form
   */
  inputValues: InputValuesType;

  /**
   * Current twitter handle (use for auth checking)
   */
  twitterHandle?: string;
};

const FaucetContext = createContext<FaucetContextType>({ inputValues: {} });
