import { serializeError } from 'eth-rpc-errors';

const DEFAULT_ERROR_CODE = 4000;
const DEFAULT_ERROR_MESSAGE = 'Unknown error';

const DEFAULT_FALLBACK_ERROR = {
  code: DEFAULT_ERROR_CODE,
  message: DEFAULT_ERROR_MESSAGE,
};

export const parseError = <T = unknown>(
  error: unknown
): { code: number; message: string; extraInfo?: T } => {
  // Maybe metaMask error
  const err = serializeError(error, {
    fallbackError: DEFAULT_FALLBACK_ERROR,
  });

  // If error is not a MetaMask error, return it as is
  if (err.code !== DEFAULT_ERROR_CODE) {
    return err;
  }

  // Handle other errors

  // If error is an instance of Error, return the error message
  // with the default error code
  if (error instanceof Error) {
    return {
      code: DEFAULT_ERROR_CODE,
      message: error.message,
      extraInfo: error as T,
    };
  }

  return DEFAULT_FALLBACK_ERROR;
};
