'use client';

import {
  DEFAULT_DECIMALS,
  ZERO_BIG_INT,
} from '@webb-tools/dapp-config/constants';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import type { TokenSelectorProps } from '@webb-tools/webb-ui-components/components/TokenSelector/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { useCallback, useMemo } from 'react';
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import { DepositFormFields } from '../../../types/restake';
import safeParseUnits from '../../../utils/safeParseUnits';

type Props = {
  amountError?: string;
  openChainModal: Noop;
  openTokenModal: Noop;
  register: UseFormRegister<DepositFormFields>;
  setValue: UseFormSetValue<DepositFormFields>;
  watch: UseFormWatch<DepositFormFields>;
};

const SourceChainInput = ({
  amountError,
  openChainModal,
  openTokenModal,
  register,
  setValue,
  watch,
}: Props) => {
  // Selectors
  const sourceTypedChainId = watch('sourceTypedChainId');
  const depositAssetId = watch('depositAssetId');

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

    const balance = balances[asset.id]?.balance ?? ZERO_BIG_INT;

    return {
      max: balance,
      maxFormatted: formatUnits(balance, asset.decimals),
    };
  }, [asset, balances]);

  const { min, minFormatted } = useMemo(() => {
    if (asset === null) return {};

    return {
      min: minDelegateAmount ?? ZERO_BIG_INT,
      minFormatted: formatUnits(
        minDelegateAmount ?? ZERO_BIG_INT,
        asset.decimals,
      ),
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

  const customAmountProsp = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(asset?.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: {
          // Check amount with asset denomination
          shouldDivisibleWithDecimals: (value) => {
            return (
              Decimal.mod(value, step).isZero() ||
              `Amount must be divisible by ${step} ${asset !== null ? `, as ${asset?.symbol} has ${asset?.decimals} decimals` : ''}`.trim()
            );
          },
          shouldNotBeZero: (value) => {
            const parsed = safeParseUnits(value, asset?.decimals);
            if (!parsed.sucess) return true;

            return (
              parsed.value !== ZERO_BIG_INT ||
              'Amount must be greater than zero'
            );
          },
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
    };
  }, [asset, max, min, minFormatted, register]);

  const tokenSelectorProps = useMemo<TokenSelectorProps>(
    () => ({
      onClick: () => openTokenModal(),
    }),
    [openTokenModal],
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
        tokenSelectorProps={tokenSelectorProps}
        customAmountProps={customAmountProsp}
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

/**
 * @internal
 * Convert decimals to input step
 * 18 decimals -> 0.000000000000000001
 */
function decimalsToStep(decimals = DEFAULT_DECIMALS) {
  if (decimals === 0) return '1';

  return `0.${'0'.repeat(decimals - 1)}1`;
}
