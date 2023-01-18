import { VAnchorActions } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { useCallback, useMemo, useState } from 'react';
import { useTxQueue } from '../transaction';

export interface VAnchorAPI {
  cancel(): Promise<void>;
  error: string;
  api: VAnchorActions<any> | null;
  startNewTransaction(): void;
}

export const useVAnchor = (): VAnchorAPI => {
  const { activeApi } = useWebContext();
  const [error] = useState('');
  const { api: txQueueApi } = useTxQueue();

  /// api
  const api = useMemo(() => {
    const api = activeApi?.methods.variableAnchor.actions;
    if (!api?.enabled) {
      return null;
    }
    return api.inner;
  }, [activeApi]);

  const cancel = useCallback(() => {
    if (!api) {
      throw new Error('Api not ready');
    }
    return api.cancel().catch(console.error);
  }, [api]);

  return {
    startNewTransaction: txQueueApi.startNewTransaction,
    api,
    error,
    cancel,
  };
};
