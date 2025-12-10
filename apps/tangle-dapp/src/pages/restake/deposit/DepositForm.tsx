import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card } from '@tangle-network/ui-components';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { FC, useCallback, useMemo, useEffect, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { parseUnits, Address, formatUnits } from 'viem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { EvmDepositFormFields } from '../../../types/restake';

import Form from '../Form';
import RestakeActionTabs from '../RestakeActionTabs';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import {
  useRestakeAssets,
  type RestakeAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDepositTx } from '@tangle-network/tangle-shared-ui/data/tx';

const getDefaultTypedChainId = (activeTypedChainId: number | null): number => {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
};

const DepositForm: FC = () => {
  const activeTypedChainId = useActiveTypedChainId();
  const { status: depositTxStatus, execute: executeDepositTx } = useDepositTx();
  const formRef = useRef<HTMLFormElement>(null);

  // Fetch restaking assets with balances
  const {
    assets,
    isLoading: isLoadingAssets,
    refetchBalances,
  } = useRestakeAssets();

  const {
    register,
    setValue: setFormValue,
    resetField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EvmDepositFormFields>({
    mode: 'onChange',
    defaultValues: {
      sourceTypedChainId: getDefaultTypedChainId(activeTypedChainId),
    },
  });

  const setValue = useCallback(
    (...params: Parameters<typeof setFormValue>) => {
      setFormValue(params[0], params[1], {
        shouldDirty: true,
        shouldValidate: true,
        ...params[2],
      });
    },
    [setFormValue],
  );

  // Register fields render on modal on mount
  useEffect(() => {
    register('depositAssetId', { required: 'Asset is required' });
    register('sourceTypedChainId', { required: 'Chain is required' });
  }, [register]);

  useEffect(() => {
    setValue('sourceTypedChainId', getDefaultTypedChainId(activeTypedChainId));
  }, [activeTypedChainId, setValue]);

  // Reset form when active chain changes.
  useEffect(() => {
    resetField('amount');
  }, [activeTypedChainId, resetField]);

  // Auto-select first asset with balance
  useEffect(() => {
    if (assets === null || isLoadingAssets) {
      return;
    }

    const defaultAsset = Array.from(assets.values()).find(
      ({ balance }) => balance > BigInt(0),
    );

    if (defaultAsset === undefined) {
      return;
    }

    setValue('depositAssetId', defaultAsset.id);
  }, [assets, setValue, isLoadingAssets]);

  const {
    status: tokenModalOpen,
    close: closeTokenModal,
    open: openTokenModal,
    update: updateTokenModal,
  } = useModal();

  const allAssets = useMemo(() => {
    if (assets === null) {
      return [];
    }

    return Array.from(assets.values()).sort((a, b) => {
      // Sort by balance descending (assets with balance first)
      if (a.balance === BigInt(0) && b.balance > BigInt(0)) return 1;
      if (b.balance === BigInt(0) && a.balance > BigInt(0)) return -1;
      if (a.balance > b.balance) return -1;
      if (a.balance < b.balance) return 1;
      return 0;
    });
  }, [assets]);

  const assetId = watch('depositAssetId');

  const asset = useMemo(() => {
    if (assets === null || assetId === undefined) {
      return null;
    }

    return assets.get(assetId) ?? null;
  }, [assetId, assets]);

  const handleAssetSelection = useCallback(
    (selectedAsset: RestakeAsset) => {
      setValue('depositAssetId', selectedAsset.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const isReady =
    executeDepositTx !== null &&
    asset !== null &&
    !isSubmitting &&
    depositTxStatus !== TxStatus.PROCESSING;

  const onSubmit = useCallback<SubmitHandler<EvmDepositFormFields>>(
    async ({ amount }) => {
      if (!isReady || !asset) {
        return;
      }

      // Parse amount to bigint using token decimals
      const amountBigInt = parseUnits(amount, asset.metadata.decimals);

      if (amountBigInt <= BigInt(0)) {
        return;
      }

      await executeDepositTx({
        token: asset.id,
        amount: amountBigInt,
      });

      setValue('amount', '', { shouldValidate: false });
      setValue('depositAssetId', undefined as unknown as Address, {
        shouldValidate: false,
      });

      // Refresh balances after deposit
      refetchBalances();
    },
    [asset, isReady, refetchBalances, executeDepositTx, setValue],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeActionTabs />

      <Card withShadow tightPadding>
        <Form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full space-y-4 grow">
            <div className="space-y-2">
              <SourceChainInputEvm
                assets={assets}
                amountError={errors.amount?.message}
                openTokenModal={openTokenModal}
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </div>

            <div className="flex flex-col justify-between gap-4 grow">
              <Details />

              <DepositActionButton
                errors={errors}
                isSubmitting={isSubmitting}
                isTransactionLoading={depositTxStatus === TxStatus.PROCESSING}
                isValid={isValid}
              />
            </div>
          </div>
        </Form>
      </Card>

      <ListModal
        title="Select Asset"
        isOpen={tokenModalOpen}
        setIsOpen={updateTokenModal}
        onSelect={handleAssetSelection}
        filterItem={(assetItem, query) =>
          filterBy(query, [
            assetItem.id,
            assetItem.metadata.name,
            assetItem.metadata.symbol,
          ])
        }
        searchInputId="restake-deposit-assets-search"
        searchPlaceholder="Search assets..."
        titleWhenEmpty="No Assets Found"
        descriptionWhenEmpty="It seems that there are no available assets on this account in this network yet. Please try again later."
        items={allAssets}
        renderItem={(assetItem) => {
          return <AssetListItemEvm asset={assetItem} />;
        }}
      />
    </StyleContainer>
  );
};

// EVM version of SourceChainInput that works with Address types
interface SourceChainInputEvmProps {
  assets: Map<Address, RestakeAsset> | null;
  amountError?: string;
  openTokenModal: () => void;
  register: ReturnType<typeof useForm<EvmDepositFormFields>>['register'];
  setValue: (name: keyof EvmDepositFormFields, value: unknown) => void;
  watch: ReturnType<typeof useForm<EvmDepositFormFields>>['watch'];
}

const SourceChainInputEvm: FC<SourceChainInputEvmProps> = ({
  assets,
  amountError,
  openTokenModal,
  register,
  setValue,
  watch,
}) => {
  const assetId = watch('depositAssetId');
  const asset = assetId ? assets?.get(assetId) : null;

  // Max button handler
  const handleMaxClick = useCallback(() => {
    if (!asset) return;
    const maxAmount = formatUnits(asset.balance, asset.metadata.decimals);
    setValue('amount', maxAmount);
  }, [asset, setValue]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-mono-140 dark:text-mono-80">
          Amount
        </label>
        {asset && (
          <button
            type="button"
            onClick={handleMaxClick}
            className="text-xs text-blue-50 hover:text-blue-40"
          >
            Max: {formatUnits(asset.balance, asset.metadata.decimals)}{' '}
            {asset.metadata.symbol}
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <input
          {...register('amount', {
            required: 'Amount is required',
            validate: (value) => {
              if (!asset) return 'Select an asset first';
              const parsed = parseUnits(value, asset.metadata.decimals);
              if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
              if (parsed > asset.balance) return 'Insufficient balance';
              return true;
            },
          })}
          type="text"
          placeholder="0.0"
          className="flex-1 px-3 py-2 border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-60 dark:border-mono-140"
        />

        <button
          type="button"
          onClick={openTokenModal}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-60 dark:border-mono-140 hover:bg-mono-20 dark:hover:bg-mono-160"
        >
          {asset ? (
            <span className="font-medium">{asset.metadata.symbol}</span>
          ) : (
            <span className="text-mono-100">Select token</span>
          )}
        </button>
      </div>

      {amountError && <p className="text-xs text-red-50">{amountError}</p>}
    </div>
  );
};

// EVM version of AssetListItem that works with RestakeAsset
interface AssetListItemEvmProps {
  asset: RestakeAsset;
}

const AssetListItemEvm: FC<AssetListItemEvmProps> = ({ asset }) => {
  const formattedBalance = formatUnits(asset.balance, asset.metadata.decimals);

  return (
    <div className="flex items-center justify-between w-full p-2">
      <div className="flex flex-col">
        <span className="font-medium">{asset.metadata.symbol}</span>
        <span className="text-xs text-mono-100">{asset.metadata.name}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm">{formattedBalance}</span>
        <span className="text-xs text-mono-100">Balance</span>
      </div>
    </div>
  );
};

// Action button for deposit form
interface DepositActionButtonProps {
  errors: ReturnType<
    typeof useForm<EvmDepositFormFields>
  >['formState']['errors'];
  isSubmitting: boolean;
  isTransactionLoading: boolean;
  isValid: boolean;
}

const DepositActionButton: FC<DepositActionButtonProps> = ({
  errors,
  isSubmitting,
  isTransactionLoading,
  isValid,
}) => {
  const displayError = errors.depositAssetId
    ? 'Select Asset'
    : errors.amount
      ? 'Enter Amount'
      : undefined;

  const isDisabled =
    !isValid ||
    displayError !== undefined ||
    isSubmitting ||
    isTransactionLoading;
  const buttonText =
    isSubmitting || isTransactionLoading
      ? 'Depositing...'
      : (displayError ?? 'Deposit');

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className="w-full px-4 py-3 font-medium text-white rounded-lg bg-blue-50 hover:bg-blue-40 disabled:bg-mono-80 disabled:cursor-not-allowed"
    >
      {buttonText}
    </button>
  );
};

export default DepositForm;
