import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
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
import type {
  DelegationFormFields,
  DelegatorInfo,
} from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import ErrorMessage from '../ErrorMessage';

type Props = {
  amountError: string | undefined;
  delegatorInfo: DelegatorInfo | null;
  openAssetModal: Noop;
  openOperatorModal: Noop;
  register: UseFormRegister<DelegationFormFields>;
  setValue: UseFormSetValue<DelegationFormFields>;
  watch: UseFormWatch<DelegationFormFields>;
};

export default function DelegationInput({
  amountError,
  delegatorInfo,
  openAssetModal,
  openOperatorModal,
  register,
  setValue,
  watch,
}: Props) {
  const selectedAssetId = watch('assetId');

  const { assetMap } = useRestakeContext();
  const { minDelegateAmount } = useRestakeConsts();

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

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue('amount', amount, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

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

  return (
    <TransactionInputCard.Root
      tokenSymbol={selectedAsset?.symbol}
      maxAmount={maxFormatted}
      onAmountChange={handleAmountChange}
    >
      <TransactionInputCard.Header>
        <TransactionInputCard.ChainSelector
          onClick={openOperatorModal}
          placeholder="Select Operator"
        />
        <TransactionInputCard.MaxAmountButton
          accountType="note"
          tooltipBody="Deposited Asset"
        />
      </TransactionInputCard.Header>

      <TransactionInputCard.Body
        tokenSelectorProps={{
          placeHolder: 'Select Asset',
          onClick: openAssetModal,
        }}
        customAmountProps={customAmountProps}
      />

      <ErrorMessage>{amountError}</ErrorMessage>
    </TransactionInputCard.Root>
  );
}
