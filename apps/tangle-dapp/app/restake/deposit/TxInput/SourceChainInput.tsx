'use client';

import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useSubscription } from 'observable-hooks';
import { type FC, useMemo } from 'react';
import { formatUnits } from 'viem';

import useRestakingAssetMap from '../../../../data/restake/useRestakingAssetMap';
import useRestakingBalances from '../../../../data/restake/useRestakingBalances';
import {
  useActions,
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../../stores/deposit';

const SourceChainInput: FC = () => {
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();
  const { updateDepositAssetId } = useActions();

  const { assetMap, assetMap$ } = useRestakingAssetMap();

  const { balances } = useRestakingBalances();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetMap$, (assetMap) => {
    if (Object.keys(assetMap).length === 0) {
      return;
    }

    const defaultAssetId = Object.keys(assetMap)[0];
    updateDepositAssetId(defaultAssetId);
  });

  const asset = useMemo(() => {
    if (depositAssetId === null) {
      return null;
    }

    return assetMap[depositAssetId] ?? null;
  }, [assetMap, depositAssetId]);

  const maxAmount = useMemo(() => {
    if (asset === null) return;

    const balance = balances[asset.id]?.balance;

    if (balance === undefined) return;

    return parseFloat(formatUnits(balance, asset.decimals));
  }, [asset, balances]);

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root tokenSymbol={asset?.symbol}>
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector typedChainId={sourceTypedChainId} />
        <TransactionInputCard.MaxAmountButton maxAmount={maxAmount} />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body customAmountProps={{ type: 'number' }} />
    </TransactionInputCard.Root>
  );
};

export default SourceChainInput;
