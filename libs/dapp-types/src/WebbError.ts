// Copyright 2024 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/* List of know error codes of the dApp */
export enum WebbErrorCodes {
  /* Api is not ready */
  ApiNotReady,
  /* No currency is available */
  NoCurrencyAvailable,
  /* No fungible token is available */
  NoFungibleTokenAvailable,
  /* No fungible token is available */
  NoWrappableTokenAvailable,
  /* No signRaw function for this injector */
  NoSignRaw,
  /* Unsupported provider */
  UnsupportedProvider,
  /* Unsupported chain is switch via the extension */
  UnsupportedChain,
  /* Unsupported wallet */
  UnsupportedWallet,
  /* Unselected chain is a mismatch between provider and application */
  UnselectedChain,
  /* Unsupported browser */
  UnsupportedBrowser,
  /* No accounts are available */
  NoAccountAvailable,
  /* No active bridge */
  NoActiveBridge,
  /* Missing endpoints in the configuration */
  NoEndpointsConfigured,
  /* No claims pallet found */
  NoClaimsPalletFound,
  /** No client available */
  NoClientAvailable,
  /** No switch chain method found */
  NoSwitchChainMethod,
  /* Failed to parse deposit note */
  NoteParsingFailure,
  /* Polkadot{.js} extension not installed */
  PolkadotJSExtensionNotInstalled,
  /* Talisman extension not installed */
  TalismanExtensionNotInstalled,
  /* SubWallet extension not installed */
  SubWalletExtensionNotInstalled,
  /* MetaMasK extension not installed */
  MetaMaskExtensionNotInstalled,
  /* Rainbow extension not installed */
  RainbowExtensionNotInstalled,
  /* Unknown wallet */
  UnknownWallet,
  /* Runtime Error on the provider */
  InsufficientProviderInterface,
  /* EVM session already ended */
  EVMSessionAlreadyEnded,
  /* Relayer does not support the functionality */
  NoRelayerSupport,
  /* Relayer is not operating properly (sending bad leaves, etc.) */
  RelayerMisbehaving,
  /* Failed to parse the chainId */
  ChainIdTypeUnformatted,
  /* Invalid amount to withdraw, */
  AmountToWithdrawExceedsTheDepositedAmount,
  /* Transaction is cancelled */
  TransactionCancelled,
  /* There is a transaction in progress */
  TransactionInProgress,
  /* Not implemented */
  NotImplemented,
  //* The anchor identifier is not found */
  AnchorIdNotFound,
  /* Insufficient disk space */
  InsufficientDiskSpace,
  /* Invalid arguments */
  InvalidArguments,
  /* No connector configured for the wallet */
  NoConnectorConfigured,
  /* Relayer has not yet relayed the commitment to the destination chain */
  CommitmentNotInTree,
  /* Switch account failed */
  SwitchAccountFailed,
  /* Switch chain failed */
  SwitchChainFailed,
  /* Failed to send the transaction to the relayer */
  FailedToSendTx,
  /** Failed to connect wallet */
  FailedToConnectWallet,
  /* Failed to disconnect the wallet */
  FailedToDisconnect,
  /* Key pair not found */
  KeyPairNotFound,
  /* Notes are not ready */
  NotesNotReady,
  /* Invalid amount */
  InvalidAmount,
  /** Invalid or unhandled enum value */
  InvalidEnumValue,
  /* Unknown error */
  UnknownError,
}

// An Error message with error metadata
type WebbErrorMessage = {
  message: string;
  code: WebbErrorCodes;
};

// WebbError an Error class to throw errors and catch them with type
export class WebbError extends Error {
  // Static `Map` for error messages that will be instilled lazily
  static errorMessageMap: Map<WebbErrorCodes, WebbErrorMessage> = new Map();
  // error message for this error
  readonly errorMessage: WebbErrorMessage;

  constructor(readonly code: WebbErrorCodes) {
    super(WebbError.getErrorMessage(code).message);
    this.errorMessage = WebbError.getErrorMessage(code);
  }

  // create a `WebbError` from the error code
  static from(code: WebbErrorCodes) {
    return new WebbError(code);
  }

  // Static method to ge the error of the map if it's there, or create it and append the map
  static getErrorMessage(code: WebbErrorCodes): WebbErrorMessage {
    const errorMessage = WebbError.errorMessageMap.get(code);

    if (errorMessage) {
      return errorMessage;
    }

    switch (code) {
      case WebbErrorCodes.ApiNotReady:
        return {
          code,
          message: 'Api is not ready',
        };

      case WebbErrorCodes.NoFungibleTokenAvailable:
        return {
          code,
          message: 'No fungible token is available',
        };

      case WebbErrorCodes.NoWrappableTokenAvailable:
        return {
          code,
          message: 'No wrappable token is available',
        };

      case WebbErrorCodes.UnsupportedProvider:
        return {
          code,
          message: 'Unsupported provider',
        };

      case WebbErrorCodes.UnsupportedChain:
        return {
          code,
          message: 'You have switched to unsupported chain',
        };

      case WebbErrorCodes.UnsupportedWallet:
        return {
          code,
          message: 'You have selected unsupported wallet',
        };

      case WebbErrorCodes.UnselectedChain:
        return {
          code,
          message: 'User did not select the chain',
        };

      case WebbErrorCodes.UnsupportedBrowser:
        return {
          code,
          message: 'Unsupported browser',
        };

      case WebbErrorCodes.NoAccountAvailable:
        return {
          code,
          message: 'No account available',
        };

      case WebbErrorCodes.NoSignRaw:
        return {
          code,
          message: 'No `signRaw` function for this injector',
        };

      case WebbErrorCodes.NoteParsingFailure:
        return {
          code,
          message: 'Failed to parse deposit note',
        };

      case WebbErrorCodes.PolkadotJSExtensionNotInstalled:
        return {
          code,
          message: 'PolkadotJS extension not installed',
        };

      case WebbErrorCodes.TalismanExtensionNotInstalled:
        return {
          code,
          message: 'Talisman extension not installed',
        };

      case WebbErrorCodes.SubWalletExtensionNotInstalled:
        return {
          code: WebbErrorCodes.SubWalletExtensionNotInstalled,
          message: 'SubWallet extension not installed',
        };

      case WebbErrorCodes.MetaMaskExtensionNotInstalled:
        return {
          code,
          message: 'MetaMask extension not installed',
        };

      case WebbErrorCodes.RainbowExtensionNotInstalled:
        return {
          code,
          message: 'Rainbow extension not installed',
        };

      case WebbErrorCodes.UnknownWallet:
        return {
          code: WebbErrorCodes.UnknownWallet,
          message: 'Unknown wallet',
        };

      case WebbErrorCodes.InsufficientProviderInterface:
        return {
          code,
          message: 'switched to insufficient api interface',
        };

      case WebbErrorCodes.EVMSessionAlreadyEnded:
        return {
          code,
          message:
            "Attempt to end session and it' already ended or unknown error",
        };

      case WebbErrorCodes.NoRelayerSupport:
        return {
          code,
          message:
            'Attempt to use a relayer which does not support the functionality',
        };

      case WebbErrorCodes.RelayerMisbehaving:
        return {
          code,
          message: 'The selected relayer is not operating properly',
        };

      case WebbErrorCodes.ChainIdTypeUnformatted:
        return {
          code,
          message: 'Parsing of a ChainIdType failed',
        };

      case WebbErrorCodes.AmountToWithdrawExceedsTheDepositedAmount:
        return {
          code,
          message: `The amount to withdraw is more than the already deposited amount`,
        };

      case WebbErrorCodes.TransactionCancelled:
        return {
          code,
          message: `Transaction is cancelled`,
        };

      case WebbErrorCodes.TransactionInProgress:
        return {
          code,
          message: `There is a transaction in progress`,
        };

      case WebbErrorCodes.NoActiveBridge:
        return {
          code,
          message: `No active bridge`,
        };

      case WebbErrorCodes.NoCurrencyAvailable:
        return {
          code,
          message: `No currency is available`,
        };

      case WebbErrorCodes.NoEndpointsConfigured:
        return {
          code,
          message: `Missing endpoints in the configuration`,
        };

      case WebbErrorCodes.NoClaimsPalletFound:
        return {
          code,
          message: `No claims pallet found`,
        };

      case WebbErrorCodes.NoClientAvailable:
        return {
          code,
          message: `No client available`,
        };

      case WebbErrorCodes.NoSwitchChainMethod:
        return {
          code,
          message: `No switch chain method found`,
        };

      case WebbErrorCodes.AnchorIdNotFound:
        return {
          code,
          message: `Not found the anchor identifier`,
        };

      case WebbErrorCodes.NotImplemented:
        return {
          code,
          message: `Not implemented`,
        };

      case WebbErrorCodes.InsufficientDiskSpace:
        return {
          code,
          message: `Insufficient disk space, please make sure you have at least 500MB of free space`,
        };

      case WebbErrorCodes.InvalidArguments:
        return {
          code,
          message: `Invalid arguments`,
        };

      case WebbErrorCodes.NoConnectorConfigured:
        return {
          code,
          message: `No connector configured for the wallet`,
        };

      case WebbErrorCodes.CommitmentNotInTree:
        return {
          code,
          message: `Relayer has not yet relayed the commitment to the destination chain`,
        };

      case WebbErrorCodes.SwitchAccountFailed:
        return {
          code,
          message: 'Failed to switch account',
        };

      case WebbErrorCodes.SwitchChainFailed:
        return {
          code,
          message: 'Failed to switch chain',
        };

      case WebbErrorCodes.FailedToSendTx:
        return {
          code,
          message: 'Failed to send the transaction to the relayer',
        };

      case WebbErrorCodes.KeyPairNotFound:
        return {
          code,
          message: 'Key pair not found',
        };

      case WebbErrorCodes.NotesNotReady:
        return {
          code,
          message:
            'Some of the notes are not ready, maybe waiting for 5-20 minutes and try again',
        };

      case WebbErrorCodes.InvalidAmount:
        return {
          code,
          message: 'Invalid amount',
        };

      case WebbErrorCodes.FailedToConnectWallet:
        return {
          code,
          message: 'Failed to connect wallet',
        };

      case WebbErrorCodes.FailedToDisconnect:
        return {
          code,
          message: 'Failed to disconnect',
        };

      case WebbErrorCodes.InvalidEnumValue:
        return {
          code,
          message: 'Invalid or unhandled enum value',
        };

      default:
        return {
          code,
          message: 'Unknown error',
        };
    }
  }

  // Coercion to sting
  toString() {
    return this.message;
  }
}
