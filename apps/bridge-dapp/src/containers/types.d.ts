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
   * The default fungible currency
   */
  defaultFungibleCurrency?: Currency;

  /**
   * The on try another wallet callback
   */
  onTryAnotherWallet?: () => void;
}
