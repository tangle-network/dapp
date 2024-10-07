export enum TangleErrorCode {
  FEATURE_NOT_SUPPORTED,
}

export const TangleErrorTitleMap: Record<TangleErrorCode, string> = {
  [TangleErrorCode.FEATURE_NOT_SUPPORTED]: 'Feature Not Supported',
};

export const TangleErrorDescriptionMap: Record<TangleErrorCode, string> = {
  [TangleErrorCode.FEATURE_NOT_SUPPORTED]:
    'The requested feature is not supported by the current API. Please try refreshing the page or switching to a different API endpoint. If the issue persists, the feature may not be available in this version of the application.',
};

export class TangleError extends Error {
  public description: string;

  constructor(public code: TangleErrorCode) {
    super(TangleErrorTitleMap[code]);

    this.name = 'TangleError';
    this.description = TangleErrorDescriptionMap[code];
  }
}
