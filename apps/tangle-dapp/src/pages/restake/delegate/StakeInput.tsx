import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import type { Noop } from '@webb-tools/dapp-types/utils/types';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import type { DelegatorInfo } from '@webb-tools/tangle-shared-ui/types/restake';
import type { IdentityType } from '@webb-tools/tangle-shared-ui/utils/polkadot/identity';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useCallback, useMemo } from 'react';
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { formatUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ErrorMessage from '../../../components/ErrorMessage';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import type { DelegationFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import AssetPlaceholder from '../AssetPlaceholder';

type Props = {
  amountError: string | undefined;
  delegatorInfo: DelegatorInfo | null;
  openAssetModal: Noop;
  openOperatorModal: Noop;
  register: UseFormRegister<DelegationFormFields>;
  setValue: UseFormSetValue<DelegationFormFields>;
  watch: UseFormWatch<DelegationFormFields>;
  operatorIdentities?: Record<string, IdentityType | null> | null;
};

export default function StakeInput({
  amountError,
  delegatorInfo,
  openAssetModal,
  openOperatorModal,
  register,
  setValue,
  watch,
  operatorIdentities,
}: Props) {
  const selectedAssetId = watch('assetId');
  const selectedOperatorAccountId = watch('operatorAccountId');

  const { assetMetadataMap } = useRestakeContext();
  const { minDelegateAmount } = useRestakeConsts();

  const selectedAsset = useMemo(
    () => (selectedAssetId !== null ? assetMetadataMap[selectedAssetId] : null),
    [assetMetadataMap, selectedAssetId],
  );

  const { max, maxFormatted } = useMemo(() => {
    if (!isDefined(selectedAsset) || !isDefined(delegatorInfo)) {
      return {};
    }

    const amountRaw =
      delegatorInfo.deposits[selectedAsset.id]?.amount ?? ZERO_BIG_INT;
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
      setValue('amount', amount);
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
    <div className="flex flex-col items-start justify-stretch">
      <TransactionInputCard.Root
        tokenSymbol={selectedAsset?.symbol}
        maxAmount={maxFormatted}
        onAmountChange={handleAmountChange}
        className="bg-mono-20 dark:bg-mono-180"
      >
        <TransactionInputCard.Header>
          <TransactionInputCard.ChainSelector
            onClick={openOperatorModal}
            placeholder="Select Operator"
            {...(selectedOperatorAccountId
              ? {
                  renderBody: () => (
                    <AvatarWithText
                      accountAddress={selectedOperatorAccountId}
                      identityName={
                        operatorIdentities?.[selectedOperatorAccountId]?.name
                      }
                      overrideTypographyProps={{ variant: 'h5' }}
                    />
                  ),
                }
              : {})}
          />

          <TransactionInputCard.MaxAmountButton
            accountType="note"
            tooltipBody="Deposited"
          />
        </TransactionInputCard.Header>

        <TransactionInputCard.Body
          tokenSelectorProps={{
            onClick: openAssetModal,
            placeholder: <AssetPlaceholder />,
          }}
          customAmountProps={customAmountProps}
        />
      </TransactionInputCard.Root>

      <ErrorMessage>{amountError}</ErrorMessage>
    </div>
  );
}
