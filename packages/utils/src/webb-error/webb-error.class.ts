/// list of know error codes of the dApp
export enum WebbErrorCodes {
  /// Unsupported chain is switch via the extension
  UnsupportedChain,
  /// Attempt to find a mixer size on a contract
  MixerSizeNotFound,
  /// No accounts are available
  NoAccountAvailable,
  /// Failed to parse deposit note
  NoteParsingFailure,
  /// PolkaDot extension not installed
  PolkaDotExtensionNotInstalled,
  /// MetaMas extension not installed
  MetaMaskExtensionNotInstalled,
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

  /// Static method to ge the error of the map if it's there , or create it and append the map
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
