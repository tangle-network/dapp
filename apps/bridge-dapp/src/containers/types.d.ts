// Shared container types for the bridge dapp
// Copyright 2022 @webb-tools/

import { Currency } from '@webb-tools/abstract-api-provider';
import { Chain } from '@webb-tools/dapp-config';

export interface BridgeTabContainerProps {
  /**
   * The default destination chain
   */
  defaultDestinationChain?: Chain;

  /**
   * The default governed currency
   */
  defaultGovernedCurrency?: Currency;

  /**
   * The on try another wallet callback
   */
  onTryAnotherWallet?: () => void;
}

export interface NoteAccountTableContainerProps {
  /**
   * The upload spend note callback
   */
  onUploadSpendNote?: () => void;

  /**
   * The callback to update the active tab when action button is clicked
   * @param {'Deposit' | 'Withdraw' | 'Transfer'} tabName - The tab name
   */
  onActiveTabChange?: (tabName: 'Deposit' | 'Withdraw' | 'Transfer') => void;

  /**
   * The callback to update the default destination chain
   * @param {Chain} chain - The chain object
   */
  onDefaultDestinationChainChange?: (chain: Chain) => void;

  /**
   * The callback to update the default governed currency
   * @param {Currency} currency - The currency object
   */
  onDefaultGovernedCurrencyChange?: (currency: Currency) => void;
}
