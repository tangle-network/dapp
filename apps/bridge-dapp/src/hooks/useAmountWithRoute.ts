import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import { AMOUNT_KEY } from '../constants';
import { StringParam, useQueryParam } from 'use-query-params';

const useAmountWithRoute = (key = AMOUNT_KEY) => {
  const [searchParams] = useSearchParams();

  const amountStr = useMemo(() => {
    const amountStr = searchParams.get(key) ?? '';
    if (amountStr.length === 0) {
      return '';
    }

    try {
      return formatEther(BigInt(amountStr));
    } catch (error) {
      console.error(error);
      return '';
    }
  }, [key, searchParams]);

  const [amount, setAmount] = useState(amountStr);
  const [, setAmountParam] = useQueryParam(AMOUNT_KEY, StringParam);

  const onAmountChange = useCallback(
    (amount: string) => {
      const validationRegex = /^\d*\.?\d*$/;
      const isValid = validationRegex.test(amount);
      if (isValid) {
        setAmount(amount);
      }
    },
    [setAmount]
  );

  // Update amount on search params with debounce
  useEffect(() => {
    function updateParams() {
      if (!amount) {
        setAmountParam(undefined);
        return;
      }

      try {
        setAmountParam(parseEther(amount).toString());
      } catch (error) {
        console.error(error);
      }
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, key, setAmountParam]);

  return [amount, onAmountChange] as const;
};

export default useAmountWithRoute;
