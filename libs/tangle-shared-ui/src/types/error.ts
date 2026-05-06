export enum TangleErrorCode {
  FEATURE_NOT_SUPPORTED,
  NO_ACTIVE_ACCOUNT,
  INVALID_PARAMS,
}

export const TangleErrorTitleMap: Record<TangleErrorCode, string> = {
  [TangleErrorCode.FEATURE_NOT_SUPPORTED]: 'Feature Not Supported',
  [TangleErrorCode.NO_ACTIVE_ACCOUNT]: 'No Active Account',
  [TangleErrorCode.INVALID_PARAMS]: 'Invalid Params',
};

export const TangleErrorDescriptionMap: Record<TangleErrorCode, string> = {
  [TangleErrorCode.FEATURE_NOT_SUPPORTED]:
    'The requested feature is not supported by the current API. Please try refreshing the page or switching to a different API endpoint. If the issue persists, the feature may not be available in this version of the application.',
  [TangleErrorCode.NO_ACTIVE_ACCOUNT]:
    'No active account found. Please connect a wallet and try again.',
  [TangleErrorCode.INVALID_PARAMS]:
    'The parameters passed to the function are invalid.',
};

export class TangleError extends Error {
  public description: string;

  constructor(public code: TangleErrorCode) {
    super(TangleErrorTitleMap[code]);

    this.name = 'TangleError';
    this.description = TangleErrorDescriptionMap[code];
  }
}
