import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import type { Noop } from '@tangle-network/dapp-types/utils/types';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import type { DelegatorInfo } from '@tangle-network/tangle-shared-ui/types/restake';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import type { TextFieldInputProps } from '@tangle-network/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/webb-ui-components/components/TransactionInputCard';
import { FC, useCallback, useMemo, useRef } from 'react';
import type {
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { formatUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ErrorMessage from '../../../components/ErrorMessage';
import useRestakeAsset from '../../../data/restake/useRestakeAsset';
import useRestakeConsts from '../../../data/restake/useRestakeConsts';
import type { DelegationFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import AssetPlaceholder from '../AssetPlaceholder';
import calculateRestakeAvailableBalance from '../../../utils/restaking/calculateRestakeAvailableBalance';

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

const RestakeDelegateInput: FC<Props> = ({
  amountError,
  delegatorInfo,
  openAssetModal,
  openOperatorModal,
  register,
  setValue,
  watch,
  operatorIdentities,
}) => {
  const selectedAssetId = watch('assetId');
  const selectedOperatorAccountId = watch('operatorAccountId');

  const { minDelegateAmount } = useRestakeConsts();
  const selectedAsset = useRestakeAsset(selectedAssetId);

  const { max, maxFormatted } = useMemo(() => {
    if (!isDefined(selectedAsset) || !isDefined(delegatorInfo)) {
      return {};
    }

    const availableBalance = calculateRestakeAvailableBalance(
      delegatorInfo,
      selectedAsset.id,
    );

    if (availableBalance === null) {
      return {};
    }

    const maxFormatted = +formatUnits(availableBalance, selectedAsset.decimals);

    return {
      max: availableBalance,
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

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
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
  }, [
    max,
    min,
    minFormatted,
    register,
    selectedAsset?.decimals,
    selectedAsset?.symbol,
  ]);

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
            tooltipBody="Available Balance"
            Icon={
              useRef({
                enabled: <LockLineIcon />,
                disabled: <LockFillIcon />,
              }).current
            }
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
};

export default RestakeDelegateInput;
