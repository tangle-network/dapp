// Copyright 2022 @webb-tools/
// SPDX-License-Identifier: Apache-2.0

/// list of know error codes of the dApp
export enum WebbErrorCodes {
  /// Unsupported chain is switch via the extension
  UnsupportedChain,
  /// Unselected chain is a mismatch between provider and application
  UnselectedChain,
  /// Attempt to find a mixer size on a contract
  MixerSizeNotFound,
  /// No accounts are available
  NoAccountAvailable,
  /// Failed to parse deposit note
  NoteParsingFailure,
  /// PolkaDot extension not installed
  PolkaDotExtensionNotInstalled,
  /// MetaMasK extension not installed
  MetaMaskExtensionNotInstalled,
  /// Runtime Error on the provider
  InsufficientProviderInterface,
  /// EVM session already ended
  EVMSessionAlreadyEnded,
  /// Relayer does not support the mixer
  RelayerUnsupportedMixer,
  /// Relayer is not operating properly (sending bad leaves, etc.)
  RelayerMisbehaving,
  /// Failed to parse the chainId
  ChainIdTypeUnformatted,
}

/// An Error message with error metadata
type WebbErrorMessage = {
  message: string;
  code: WebbErrorCodes;
};

/// WebbError an Error class to throw errors and catch them with type
export class WebbError extends Error {
  /// Static `Map` for error messages that will be instilled lazily
  static errorMessageMap: Map<WebbErrorCodes, WebbErrorMessage> = new Map();
  /// error message for this error
  readonly errorMessage: WebbErrorMessage;

  constructor(readonly code: WebbErrorCodes) {
    super(WebbError.getErrorMessage(code).message);
    this.errorMessage = WebbError.getErrorMessage(code);
  }

  /// create a `WebbError` from the error code
  static from(code: WebbErrorCodes) {
    return new WebbError(code);
  }

  /// Static method to ge the error of the map if it's there, or create it and append the map
  static getErrorMessage(code: WebbErrorCodes): WebbErrorMessage {
    const errorMessage = WebbError.errorMessageMap.get(code);

    if (errorMessage) {
      return errorMessage;
    }

    switch (code) {
      case WebbErrorCodes.UnsupportedChain:
        return {
          code,
          message: 'you have switched to unsupported chain',
        };
      case WebbErrorCodes.UnselectedChain:
        return {
          code,
          message: 'User did not select the chain',
        };
      case WebbErrorCodes.MixerSizeNotFound:
        return {
          code,
          message: 'Mixer size not found in contract',
        };
      case WebbErrorCodes.NoAccountAvailable:
        return {
          code,
          message: 'No account available',
        };
      case WebbErrorCodes.NoteParsingFailure:
        return {
          code,
          message: 'Failed to parse deposit note',
        };
      case WebbErrorCodes.PolkaDotExtensionNotInstalled:
        return {
          code,
          message: 'PolkaDot extension no installed',
        };
      case WebbErrorCodes.MetaMaskExtensionNotInstalled:
        return {
          code,
          message: 'MetaMask extension no installed',
        };
      case WebbErrorCodes.InsufficientProviderInterface:
        return {
          code,
          message: 'switched to insufficient api interface',
        };
      case WebbErrorCodes.EVMSessionAlreadyEnded:
        return {
          code,
          message: "Attempt to end session and it' already ended or unknown error",
        };
      case WebbErrorCodes.RelayerUnsupportedMixer:
        return {
          code,
          message: 'Attempt to use a relayer which does not support the mixer',
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

      default:
        return {
          code,
          message: 'Unknown error',
        };
    }
  }

  /// Coercion to sting
  toString() {
    return this.message;
  }
}
