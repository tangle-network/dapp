import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import type { Noop } from '@tangle-network/dapp-types/utils/types';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import type {
  DelegatorInfo,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';
import type { IdentityType } from '@tangle-network/tangle-shared-ui/utils/polkadot/identity';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { FC, useCallback, useMemo, useRef } from 'react';
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
import calculateRestakeAvailableBalance from '../../../utils/restaking/calculateRestakeAvailableBalance';
import useNativeRestakeAssetBalance from '../../../data/restake/useNativeRestakeAssetBalance';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

type Props = {
  amountError: string | undefined;
  delegatorInfo: DelegatorInfo | null;
  openAssetModal: Noop;
  openOperatorModal: Noop;
  register: UseFormRegister<DelegationFormFields>;
  setValue: UseFormSetValue<DelegationFormFields>;
  watch: UseFormWatch<DelegationFormFields>;
  operatorIdentities?: Map<SubstrateAddress, IdentityType | null> | null;
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  selectedAsset?: RestakeAsset | null;
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
  assets,
  selectedAsset: propSelectedAsset,
}) => {
  const selectedAssetId = watch('assetId');
  const selectedOperatorAccountId = watch('operatorAccountId');

  const { minDelegateAmount } = useRestakeConsts();
  const nativeAssetBalance = useNativeRestakeAssetBalance();

  const selectedAsset = useMemo(() => {
    if (propSelectedAsset) {
      return propSelectedAsset;
    }
    return assets?.get(selectedAssetId) ?? null;
  }, [assets, selectedAssetId, propSelectedAsset]);

  const availableBalance = useMemo(() => {
    if (selectedAsset === null) {
      return null;
    }

    if (selectedAsset.balance) {
      return BigInt(selectedAsset.balance.toString());
    }

    if (selectedAssetId === NATIVE_ASSET_ID) {
      return nativeAssetBalance === null
        ? null
        : BigInt(nativeAssetBalance.toString());
    } else if (delegatorInfo === null) {
      return null;
    } else {
      return calculateRestakeAvailableBalance(delegatorInfo, selectedAsset.id);
    }
  }, [delegatorInfo, nativeAssetBalance, selectedAsset, selectedAssetId]);

  const { max, maxFormatted } = useMemo(() => {
    if (selectedAsset === null || availableBalance === null) {
      return {};
    }

    const maxFormatted = +formatUnits(
      availableBalance,
      selectedAsset.metadata.decimals,
    );

    return {
      max: availableBalance,
      maxFormatted,
    };
  }, [availableBalance, selectedAsset]);

  const { min, minFormatted } = useMemo(() => {
    if (!isDefined(minDelegateAmount) || !isDefined(selectedAsset)) {
      return {};
    }

    return {
      min: minDelegateAmount,
      minFormatted: formatUnits(
        minDelegateAmount,
        selectedAsset.metadata.decimals,
      ),
    };
  }, [minDelegateAmount, selectedAsset]);

  const handleAmountChange = useCallback(
    (amount: string) => {
      setValue('amount', amount);
    },
    [setValue],
  );

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAsset?.metadata.decimals);

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
          selectedAsset?.metadata.decimals,
          selectedAsset?.metadata.symbol,
        ),
      }),
    };
  }, [
    max,
    min,
    minFormatted,
    register,
    selectedAsset?.metadata.decimals,
    selectedAsset?.metadata.symbol,
  ]);

  return (
    <div className="flex flex-col items-start justify-stretch">
      <TransactionInputCard.Root
        tokenSymbol={selectedAsset?.metadata.symbol}
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
                        operatorIdentities?.get(selectedOperatorAccountId)?.name
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
