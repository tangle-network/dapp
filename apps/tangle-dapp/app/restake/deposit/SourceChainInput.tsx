'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { debounce } from 'lodash';
import isNumber from 'lodash/isNumber';
import { useSubscription } from 'observable-hooks';
import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { formatUnits, parseUnits } from 'viem';

import { DEFAULT_DEBOUNCE_DELAY } from '../../../constants';
import useRestakeAssetMap from '../../../data/restake/useRestakeAssetMap';
import useRestakeBalances from '../../../data/restake/useRestakeBalances';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import {
  useActions,
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../stores/deposit';
import ensureError from '../../../utils/ensureError';

const SourceChainInput = () => {
  // Selectors
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();

  const { updateDepositAssetId, updateAmount } = useActions();

  const { assetMap, assetMap$ } = useRestakeAssetMap();

  const { balances } = useRestakeBalances();

  const { minDelegateAmount } = useRestakeConsts();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetMap$, (assetMap) => {
    if (Object.keys(assetMap).length === 0) {
      return;
    }

    const defaultAssetId = Object.keys(assetMap)[0];
    updateDepositAssetId(defaultAssetId);
  });

  const [errorMessage, setErrorMessage] = useState('');

  const setErrorMessageRef = useRef(
    debounce(setErrorMessage, DEFAULT_DEBOUNCE_DELAY),
  );

  const updateAmountRef = useRef(
    debounce(updateAmount, DEFAULT_DEBOUNCE_DELAY),
  );

  const amountInputRef = useRef<HTMLInputElement | null>(null);

  const asset = useMemo(() => {
    if (depositAssetId === null) {
      return null;
    }

    return assetMap[depositAssetId] ?? null;
  }, [assetMap, depositAssetId]);

  const { max, maxAmount } = useMemo(() => {
    if (asset === null) return {};

    const balance = balances[asset.id]?.balance;

    if (balance === undefined) return {};

    return { max: balance, maxAmount: +formatUnits(balance, asset.decimals) };
  }, [asset, balances]);

  const handleMaxAmount = useCallback((amount: string) => {
    amountInputRef.current?.focus();

    if (amountInputRef.current !== null) {
      amountInputRef.current.value = amount;
    }
  }, []);

  const amountProps = useMemo(
    () => ({
      max,
      min: minDelegateAmount,
      decimals: asset?.decimals,
      onAmountChange: (amount: bigint) => {
        updateAmountRef.current(amount);
      },
      onError: (error: string) => {
        setErrorMessageRef.current(error);
      },
    }),
    [asset?.decimals, max, minDelegateAmount],
  );

  useAmountInputHandlers(amountInputRef, amountProps);

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root
      tokenSymbol={asset?.symbol}
      errorMessage={errorMessage}
    >
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector typedChainId={sourceTypedChainId} />
        <TransactionInputCard.MaxAmountButton
          maxAmount={maxAmount}
          onAmountChange={handleMaxAmount}
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
        customAmountProps={{
          ref: amountInputRef,
          required: true,
          type: 'number',
        }}
      />

      {errorMessage && (
        <Typography
          component="p"
          variant="body4"
          fw="bold"
          className="mt-2 text-red-70 dark:text-red-50"
        >
          {errorMessage}
        </Typography>
      )}
    </TransactionInputCard.Root>
  );
};

export default SourceChainInput;

type Options = {
  max?: bigint | null;
  min?: bigint | null;
  decimals?: number | null;
  onAmountChange?: (amount: bigint) => void;
  onError?: (error: string) => void;
};

/**
 * @internal
 */
const useAmountInputHandlers = <E extends HTMLInputElement = HTMLInputElement>(
  ref: RefObject<E | null | undefined>,
  { max, min, decimals, onAmountChange, onError }: Options = {},
) => {
  useEffect(() => {
    if (ref.current === null || ref.current === undefined) return;

    const element = ref.current;

    const inputChangeHandler = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const value = target.value;

      if (value === '') {
        onAmountChange?.(ZERO_BIG_INT);
        onError?.('');
        return;
      }

      const { error, amount } = safeParseAmount(value, decimals, min, max);
      onError?.(error);
      onAmountChange?.(amount);
    };

    element.addEventListener('input', inputChangeHandler);

    return () => {
      element.removeEventListener('input', inputChangeHandler);
    };
  }, [ref, onAmountChange, onError, min, max, decimals, ref.current?.value]);
};

/**
 * @internal
 */
function safeParseAmount(
  amount: string,
  decimals?: number | null,
  min?: bigint | null,
  max?: bigint | null,
): {
  error: string;
  amount: bigint;
} {
  if (amount === '')
    return {
      amount: ZERO_BIG_INT,
      error: 'Amount is empty',
    };

  const fmtAmount = safeParseUints(amount, decimals).amount;

  if (typeof min === 'bigint' && fmtAmount < min) {
    return {
      error: 'Amount must be greater than or equal to the minimum amount',
      amount: fmtAmount,
    };
  }

  if (typeof max === 'bigint' && fmtAmount > max) {
    return {
      error: 'Amount must be less than or equal to the maximum amount',
      amount: fmtAmount,
    };
  }

  return {
    error: '',
    amount: fmtAmount,
  } as const;
}

/**
 * @internal
 */
function safeParseUints(value: string, decimals?: number | null) {
  if (!isNumber(decimals)) {
    return {
      error: '',
      amount: ZERO_BIG_INT,
    };
  }

  try {
    return {
      error: '',
      amount: parseUnits(value, decimals),
    };
  } catch (error) {
    return {
      error: ensureError(error).message,
      amount: ZERO_BIG_INT,
    };
  }
}
