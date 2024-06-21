'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatUnits, parseUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useIsMountedRef from '../../../hooks/useIsMountedRef';
import {
  useActions,
  useAmount,
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../stores/deposit';

const SourceChainInput = () => {
  // Selectors
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();
  const amount = useAmount();

  const { assetMap, balances } = useRestakeContext();

  const { minDelegateAmount } = useRestakeConsts();

  const { updateAmount } = useActions();

  const router = useRouter();

  const asset = useMemo(() => {
    if (depositAssetId === null) {
      return null;
    }

    return assetMap[depositAssetId] ?? null;
  }, [assetMap, depositAssetId]);

  const { max, maxFormatted } = useMemo(() => {
    if (asset === null) return {};

    const balance = balances[asset.id]?.balance;

    if (balance === undefined) return {};

    return {
      max: balance,
      maxFormatted: formatUnits(balance, asset.decimals),
    };
  }, [asset, balances]);

  const { min, minFormatted } = useMemo(() => {
    if (asset === null || typeof minDelegateAmount !== 'bigint') return {};

    return {
      min: minDelegateAmount,
      minFormatted: formatUnits(minDelegateAmount, asset.decimals),
    };
  }, [asset, minDelegateAmount]);

  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue(amount);

      if (amount === '') {
        updateAmount(ZERO_BIG_INT);
        setError('Amount is required');
        return;
      }

      if (asset === null) {
        return;
      }

      // Convertion here is safe because the input is type="number"
      const parsedAmount = parseUnits(amount, asset.decimals);
      if (typeof min === 'bigint' && parsedAmount < min) {
        updateAmount(ZERO_BIG_INT);
        setError(
          `Minimum amount is ${minFormatted ?? ''} ${asset.symbol}`.trim(),
        );
        return;
      } else if (typeof max === 'bigint' && parsedAmount > max) {
        updateAmount(ZERO_BIG_INT);
        setError(`Insufficient balance`);
        return;
      }

      setError('');
      updateAmount(parsedAmount);
    },
    [asset, min, max, updateAmount, minFormatted],
  );

  const handleChainSelectorClick = useCallback(() => {
    router.push('/restake/deposit/select-source-chain');
  }, [router]);

  const isMountedRef = useIsMountedRef();
  const initialized = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current || typeof asset?.decimals !== 'number') return;

    if (initialized.current) return;

    setValue(formatUnits(amount, asset.decimals));
    initialized.current = true;
  }, [amount, asset?.decimals, isMountedRef]);

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root tokenSymbol={asset?.symbol} errorMessage={error}>
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector
          typedChainId={sourceTypedChainId}
          onClick={handleChainSelectorClick}
        />
        <TransactionInputCard.MaxAmountButton
          maxAmount={
            typeof maxFormatted === 'string' ? +maxFormatted : undefined
          }
          onAmountChange={handleAmountChange}
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
        amount={value}
        onAmountChange={handleAmountChange}
        customAmountProps={{
          type: 'number',
        }}
      />

      <Typography
        component="p"
        variant="body4"
        fw="bold"
        className="h-4 mt-2 text-red-70 dark:text-red-50"
      >
        {error}
      </Typography>
    </TransactionInputCard.Root>
  );
};

export default SourceChainInput;
