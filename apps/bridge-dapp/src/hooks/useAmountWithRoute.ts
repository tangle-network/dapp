import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatEther, parseEther } from 'viem';
import { AMOUNT_KEY } from '../constants';

const useAmountWithRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const amountStr = useMemo(() => {
    const amountStr = searchParams.get(AMOUNT_KEY) ?? '';

    return amountStr.length ? formatEther(BigInt(amountStr)) : '';
  }, [searchParams]);

  const [amount, setAmount] = useState(amountStr);

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
        return setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete(AMOUNT_KEY);
          return nextParams;
        });
      }

      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set(AMOUNT_KEY, `${parseEther(amount)}`);
        return nextParams;
      });
    }

    const timeout = setTimeout(updateParams, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [amount, setSearchParams]);

  return [amount, onAmountChange] as const;
};

export default useAmountWithRoute;
