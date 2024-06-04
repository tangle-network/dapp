'use client';

import Decimal from 'decimal.js';
import { useMemo } from 'react';

import useTypedChainId from './useTypedChainId';
import useSelectedToken from './useSelectedToken';

export default function useMinAmount() {
  const { sourceTypedChainId } = useTypedChainId();
  const selectedToken = useSelectedToken();

  const minAmount = useMemo(() => {
    const existentialDeposit =
      selectedToken.existentialDeposit[sourceTypedChainId];
    const destChainTransactionFee =
      selectedToken.destChainTransactionFee[sourceTypedChainId];

    if (!existentialDeposit || !destChainTransactionFee) return null;

    // TODO: add bridge fees
    return (existentialDeposit ?? new Decimal(0)).add(
      destChainTransactionFee ?? new Decimal(0),
    );
  }, [
    selectedToken.existentialDeposit,
    selectedToken.destChainTransactionFee,
    sourceTypedChainId,
  ]);

  return minAmount;
}
