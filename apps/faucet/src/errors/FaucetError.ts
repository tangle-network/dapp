import FaucetErrorCode from './FaucetErrorCode';
import ErrorPayload from './FaucetErrorPayload';

const errorMessages: {
  [key in FaucetErrorCode]: string;
} = {
  [FaucetErrorCode.MISSING_ENV_VAR]: 'Missing environment variable',
  [FaucetErrorCode.INVALID_STORE_KEY]: 'Invalid store key',
  [FaucetErrorCode.TWITTER_LOGIN_FAILED]: 'Twitter login failed',
  [FaucetErrorCode.INVALID_RESPONSE]: 'Invalid response',
  [FaucetErrorCode.INVALID_PARAMS]: 'Invalid parameters',
  [FaucetErrorCode.REFRESH_TOKENS_FAILED]: 'Refresh tokens failed',
  [FaucetErrorCode.TWITTER_LOGIN_DENIED]: 'Twitter login denied',
  [FaucetErrorCode.UNKNOWN]: 'Unknown error',
  [FaucetErrorCode.UNKNOWN_TWITTER_ERROR]: 'Unknown Twitter error',
};

/**
 * Custom error class for the faucet
 */
class FaucetError<Code extends FaucetErrorCode> extends Error {
  // Private prevent mutation
  private code: Code;
  private payload?: ErrorPayload[Code];

  /**
   * Private constructor to prevent direct instantiation
   * @param message Error message
   */
  private constructor(errorCode: Code, payload?: ErrorPayload[Code]) {
    const message = errorMessages[errorCode];
    super(message);

    this.code = errorCode;
    this.payload = payload;
    this.name = 'FaucetError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, FaucetError.prototype);
  }

  /**
   * Get the error message
   * @returns The error message
   */
  getErrorMessage(): string {
    return errorMessages[this.code];
  }

  /**
   * Get the FaucetErrorCode
   * @returns The FaucetErrorCode
   */
  getErrorCode(): FaucetErrorCode {
    return this.code;
  }

  /**
   * Get the payload if it exists
   * @returns The payload if it exists, otherwise undefined
   */
  getPayload(): ErrorPayload[Code] | undefined {
    return this.payload;
  }

  /**
   * Create a new FaucetError instance
   * @param errorCode The FaucetErrorCode
   * @param payload Optional payload to be included in the error message
   * @returns A new FaucetError instance
   */
  static from<Code extends FaucetErrorCode>(
    errorCode: Code,
    payload?: ErrorPayload[Code]
  ): FaucetError<Code> {
    return new FaucetError(errorCode, payload);
  }

  /**
   * Create a new FaucetError instance from a Twitter error
   * @param error the error which is parsed from the search params
   * @returns a FaucetError instance
   */
  static fromTwitterError(
    error: string
  ):
    | FaucetError<FaucetErrorCode.UNKNOWN_TWITTER_ERROR>
    | FaucetError<FaucetErrorCode.TWITTER_LOGIN_DENIED> {
    if (error === 'access_denied') {
      return FaucetError.from(FaucetErrorCode.TWITTER_LOGIN_DENIED);
    }

    return FaucetError.from(FaucetErrorCode.UNKNOWN_TWITTER_ERROR, { error });
  }

  /**
   * Get the error message for the given FaucetErrorCode
   * @param code The FaucetErrorCode to get the error message for
   * @returns The error message for the given FaucetErrorCode
   */
  static getErrorMessage(code: FaucetErrorCode): string {
    return errorMessages[code];
  }
}

export default FaucetError;
