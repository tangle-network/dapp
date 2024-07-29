'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import type { TokenSelectorProps } from '@webb-tools/webb-ui-components/components/TokenSelector/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
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
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import AssetPlaceholder from '../AssetPlaceholder';
import ErrorMessage from '../ErrorMessage';

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
      setValue('amount', amount);
    },
    [setValue],
  );

  const handleChainSelectorClick = useCallback(
    () => openChainModal(),
    [openChainModal],
  );

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(asset?.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: getAmountValidation(
          step,
          minFormatted,
          min,
          max,
          asset?.decimals,
          asset?.symbol,
        ),
      }),
    };
  }, [asset, max, min, minFormatted, register]);

  const tokenSelectorProps = useMemo<TokenSelectorProps>(
    () => ({
      onClick: () => openTokenModal(),
      placeholder: <AssetPlaceholder />,
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
        customAmountProps={customAmountProps}
      />

      <ErrorMessage>{amountError}</ErrorMessage>
    </TransactionInputCard.Root>
  );
};

export default SourceChainInput;
