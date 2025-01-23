import { TxEventHandlers } from '@webb-tools/abstract-api-provider/transaction-events';
import { useMemo, useState } from 'react';

/**
 * Hook to get the status from the event handlers
 * @returns the status and the event handlers
 */
const useTransactionInfo = <Context extends Record<string, unknown>>() => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const eventHandlers = useMemo(
    () =>
      ({
        onTxSending: () => {
          setIsLoading(true);
          setError(null);
          setIsSuccess(false);
        },
        onTxInBlock: () => {
          setIsLoading(true);
          setError(null);
          setIsSuccess(false);
        },
        onTxFinalized: () => {
          setIsLoading(true);
          setError(null);
          setIsSuccess(false);
        },
        onTxSuccess: () => {
          setIsLoading(false);
          setError(null);
          setIsSuccess(true);
        },
        onTxFailed: (error) => {
          setIsLoading(false);
          setError(error);
          setIsSuccess(false);
        },
      }) satisfies TxEventHandlers<Context>,
    [],
  );

  return {
    isLoading,
    error,
    isSuccess,
    eventHandlers,
  };
};

export default useTransactionInfo;
