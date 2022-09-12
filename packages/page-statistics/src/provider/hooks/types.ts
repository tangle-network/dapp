export type Page<T> = {
  items: T[];
  pageInfo: {
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
};
export type Loadable<T> = {
  val: T | null;
  isLoading: boolean;
  isFailed: boolean;
  failed?: string;
};
// SPDX-License-Identifier: Apache-2.0

// Auto-generated , DO NOT EDIT

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
