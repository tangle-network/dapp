'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useRouter } from 'next/navigation';
import { useSubscription } from 'observable-hooks';
import { useCallback, useMemo, useRef, useState } from 'react';
import { formatUnits } from 'viem';

import useRestakeAssetMap from '../../../data/restake/useRestakeAssetMap';
import useRestakeBalances from '../../../data/restake/useRestakeBalances';
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

  const { updateDepositAssetId } = useActions();

  const { assetMap, assetMap$ } = useRestakeAssetMap();

  const { balances } = useRestakeBalances();

  const { minDelegateAmount } = useRestakeConsts();

  const router = useRouter();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetMap$, (assetMap) => {
    if (Object.keys(assetMap).length === 0) {
      return;
    }

    const defaultAssetId = Object.keys(assetMap)[0];
    updateDepositAssetId(defaultAssetId);
  });

  const [errorMessage, setErrorMessage] = useState('');

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

  const handleChainSelectorClick = useCallback(() => {
    router.push('/restake/deposit/select-source-chain');
  }, [router]);

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root
      tokenSymbol={asset?.symbol}
      errorMessage={errorMessage}
    >
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector
          typedChainId={sourceTypedChainId}
          onClick={handleChainSelectorClick}
        />
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
