'use client';

import type { Noop } from '@webb-tools/dapp-types/utils/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useCallback, useMemo } from 'react';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import {
  useDepositAssetId,
  useSourceTypedChainId,
} from '../../../stores/deposit';
import { DepositFormFields } from '../../../types/restake';
import safeParseUnits from '../../../utils/safeParseUnits';

type Props = {
  openChainModal: Noop;
  setValue: UseFormSetValue<DepositFormFields>;
  register: UseFormRegister<DepositFormFields>;
  amountError?: string;
};

const SourceChainInput = ({
  openChainModal,
  register,
  setValue,
  amountError,
}: Props) => {
  // Selectors
  const sourceTypedChainId = useSourceTypedChainId();
  const depositAssetId = useDepositAssetId();

  const { assetMap, balances } = useRestakeContext();

  const { minDelegateAmount } = useRestakeConsts();

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

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue('amount', amount, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const handleChainSelectorClick = useCallback(
    () => openChainModal(),
    [openChainModal],
  );

  return (
    // Pass token symbol to root here to share between max amount & token selection button
    <TransactionInputCard.Root
      tokenSymbol={asset?.symbol}
      errorMessage={amountError}
    >
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
        customAmountProps={{
          type: 'number',
          ...register('amount', {
            required: 'Amount is required',
            validate: {
              shouldNotLessThanMin: (value) => {
                if (typeof min !== 'bigint') return true;

                const parsed = safeParseUnits(value, asset?.decimals);
                if (!parsed.sucess) return true;

                return (
                  parsed.value >= min ||
                  `Amount must be at least ${minFormatted} ${asset?.symbol ?? ''}`.trim()
                );
              },
              shouldNotExceedMax: (value) => {
                if (typeof max !== 'bigint') return true;

                const parsed = safeParseUnits(value, asset?.decimals);
                if (!parsed.sucess) return true;

                return parsed.value <= max || 'Amount exceeds balance';
              },
            },
          }),
        }}
      />

      <Typography
        component="p"
        variant="body4"
        fw="bold"
        className="h-4 mt-2 text-red-70 dark:text-red-50"
      >
        {amountError}
      </Typography>
    </TransactionInputCard.Root>
  );
};

export default SourceChainInput;
