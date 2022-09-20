/**
 * A Type that wraps an API call value for a list view
 * @param T The type of the value
 * @param items - list of the items for the page
 * @param pageInfo - information about the page
 * */
export type Page<T> = {
  items: T[];
  pageInfo: {
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
/**
 * A Type that wraps an API call value
 * @param T - The type of the value should be null if the call is not yet complete
 * @param isLoading - A boolean that indicates if the call is still loading
 * @param isFailed - A boolean that indicates if the call has failed
 * @package error - An error message if the call has failed
 * */
export type Loadable<T> = {
  val: T | null;
  isLoading: boolean;
  isFailed: boolean;
  error?: string;
};

export type PageInfoQuery<Filter = null> = {
  offset: number;
  perPage: number;
  filter: Filter;
};

export enum SessionKeyStatus {
  Generated = 'Generated',

  Signed = 'Signed',

  Rotated = 'Rotated',
}

export enum ProposalStatus {
  Signed = 'Signed',

  Open = 'Open',

  Rejected = 'Rejected',

  Accepted = 'Accepted',

  Removed = 'Removed',

  Executed = 'Executed',

  FailedToExecute = 'FailedToExecute',
}
export interface SessionKeyHistory {
  stage: SessionKeyStatus;

  txHash: string;

  blockNumber: string;

  timestamp: string;
}
export interface DKGAuthority {
  authorityId: string;

  accountId: string;

  reputation?: string;
}
export interface Threshold {
  next: number;

  current: number;

  pending: number;
}
