import { TransactionState } from '@webb-tools/abstract-api-provider';
import React from 'react';

export const getMessageFromTransactionState = (state: TransactionState) => {
  switch (state) {
    case TransactionState.FetchingFixtures: {
      return 'Fetching ZK Fixtures';
    }

    case TransactionState.FetchingLeaves: {
      return 'Fetching Leaves';
    }

    case TransactionState.GeneratingZk: {
      return 'Generating ZK Proof';
    }

    case TransactionState.SendingTransaction: {
      return 'Sending Transaction';
    }

    default: {
      return '';
    }
  }
};
