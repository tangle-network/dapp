'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import isNumber from 'lodash/isNumber';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import {
  useActions,
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../stores/deposit';

const SourceChainInput = () => {
  // Selectors
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();

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

  const max = useMemo(() => {
    if (asset === null) return;

    const balance = balances[asset.id]?.balance;

    if (balance === undefined) return;

    return +formatUnits(balance, asset.decimals);
  }, [asset, balances]);

  const min = useMemo(() => {
    if (asset === null || typeof minDelegateAmount !== 'bigint') return;

    return +formatUnits(minDelegateAmount, asset.decimals);
  }, [asset, minDelegateAmount]);

  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue(amount);

      if (amount === '') return;

      // Convertion here is safe because the input is type="number"
      const amountNum = +amount;
      if (isNumber(min) && amountNum < min) {
        setError(
          `Minimum amount is ${new Decimal(min).toString()} ${asset?.symbol ?? ''}`.trim(),
        );
        return;
      } else if (isNumber(max) && amountNum > max) {
        setError(`Insufficient balance`);
        return;
      }

      setError('');
      updateAmount(amountNum);
    },
    [min, max, updateAmount, asset?.symbol],
  );

  const handleChainSelectorClick = useCallback(() => {
    router.push('/restake/deposit/select-source-chain');
  }, [router]);

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root
      tokenSymbol={asset?.symbol}
      errorMessage={error}
      amount={value}
      onAmountChange={handleAmountChange}
    >
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector
          typedChainId={sourceTypedChainId}
          onClick={handleChainSelectorClick}
        />
        <TransactionInputCard.MaxAmountButton
          maxAmount={max}
          onAmountChange={handleAmountChange}
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
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
