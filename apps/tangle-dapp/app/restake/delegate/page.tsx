'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import keys from 'lodash/keys';
import { useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import type { DelegationFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import ErrorMessage from '../ErrorMessage';
import RestakeTabs from '../RestakeTabs';

export default function DelegatePage() {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DelegationFormFields>({
    mode: 'onBlur',
  });

  const { assetMap } = useRestakeContext();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { minDelegateAmount } = useRestakeConsts();

  const depositedAssets = useMemo(() => {
    if (delegatorInfo === null) {
      return [];
    }

    return keys(delegatorInfo.deposits).map((assetId) => assetMap[assetId]);
  }, [assetMap, delegatorInfo]);

  // Set the default assetId to the first assetId in the depositedAssets
  const defaultAssetId = useMemo(
    () => (depositedAssets.length > 0 ? depositedAssets[0].id : null),
    [depositedAssets],
  );

  // Register select fields on mount
  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAccountId', { required: 'Operator is required' });
  }, [register]);

  useEffect(() => {
    if (defaultAssetId !== null) {
      setValue('assetId', defaultAssetId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [defaultAssetId, setValue]);

  const selectedAssetId = watch('assetId');

  const selectedAsset = useMemo(
    () => (selectedAssetId !== null ? assetMap[selectedAssetId] : null),
    [assetMap, selectedAssetId],
  );

  const { max, maxFormatted } = useMemo(() => {
    if (!isDefined(selectedAsset) || !isDefined(delegatorInfo)) {
      return {};
    }

    const amountRaw = delegatorInfo.deposits[selectedAsset.id]?.amount;
    if (!isDefined(amountRaw)) {
      return {};
    }

    const maxFormatted = +formatUnits(amountRaw, selectedAsset.decimals);

    return {
      max: amountRaw,
      maxFormatted,
    };
  }, [delegatorInfo, selectedAsset]);

  const { min, minFormatted } = useMemo(() => {
    if (!isDefined(minDelegateAmount) || !isDefined(selectedAsset)) {
      return {};
    }

    return {
      min: minDelegateAmount,
      minFormatted: formatUnits(minDelegateAmount, selectedAsset.decimals),
    };
  }, [minDelegateAmount, selectedAsset]);

  const customAmountProps = useMemo<TextFieldInputProps>(
    () => {
      const step = decimalsToStep(selectedAsset?.decimals);

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
            selectedAsset?.decimals,
            selectedAsset?.symbol,
          ),
        }),
      };
    },
    // prettier-ignore
    [max, min, minFormatted, register, selectedAsset?.decimals, selectedAsset?.symbol],
  );

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue('amount', amount, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>((data) => {
    console.log(data);
  }, []);

  return (
    <form
      className="relative h-full overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col h-full space-y-4 grow">
        <RestakeTabs />

        <div className="space-y-2">
          <TransactionInputCard.Root
            tokenSymbol={selectedAsset?.symbol}
            maxAmount={maxFormatted}
            onAmountChange={handleAmountChange}
          >
            <TransactionInputCard.Header>
              <TransactionInputCard.ChainSelector placeholder="Select Operator" />
              <TransactionInputCard.MaxAmountButton
                accountType="note"
                tooltipBody="Deposited Asset"
              />
            </TransactionInputCard.Header>

            <TransactionInputCard.Body
              tokenSelectorProps={{
                placeHolder: 'Select Asset',
              }}
              customAmountProps={customAmountProps}
            />

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </TransactionInputCard.Root>
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <FeeDetails
            isDefaultOpen
            items={[
              {
                name: 'Unstake period',
                info: 'Number of rounds that delegators remain bonded before the exit request is executable.',
              },
            ]}
          />

          <Button isFullWidth type="submit">
            Delegate
          </Button>
        </div>
      </div>
    </form>
  );
}
