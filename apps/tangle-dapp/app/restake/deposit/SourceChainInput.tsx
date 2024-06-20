'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import {
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../stores/deposit';

const SourceChainInput = () => {
  // Selectors
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();

  const { assetMap, balances } = useRestakeContext();

  const { minDelegateAmount } = useRestakeConsts();

  const router = useRouter();

  // TODO: Add error message
  const errorMessage = '';

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

  // TODO: Add max amount handler
  const handleMaxAmount = useCallback((amount: string) => {
    console.log('Max amount:', amount);
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
          maxAmount={max}
          onAmountChange={handleMaxAmount}
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
        customAmountProps={{
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
