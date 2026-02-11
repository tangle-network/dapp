import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { ChainIcon } from '@tangle-network/icons/ChainIcon';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card, DropdownField } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useFormSetValue from '../../../hooks/useFormSetValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { erc20Abi, formatUnits, parseUnits, zeroAddress, Address } from 'viem';
import { BN } from '@polkadot/util';
import { useChainId } from 'wagmi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { EvmDepositFormFields } from '../../../types/restake';
import { QueryParamKey } from '../../../types';
import useQueryState from '../../../hooks/useQueryState';
import decimalsToStep from '../../../utils/decimalsToStep';
import AssetPlaceholder from '../AssetPlaceholder';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import AssetListItem from '../../../components/Lists/AssetListItem';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import type { RestakeAsset } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useOptionalRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useContractWrite,
  useDepositTx,
} from '@tangle-network/tangle-shared-ui/data/tx';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import type { LockDuration } from '@tangle-network/tangle-shared-ui/data/graphql/useDelegator';

const getDefaultTypedChainId = (activeTypedChainId: number | null): number => {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
};

const DepositForm: FC = () => {
  const activeTypedChainId = useActiveTypedChainId();
  const chainId = useChainId();
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const {
    status: depositTxStatus,
    execute: executeDepositTx,
    txHash: depositTxHash,
  } = useDepositTx();
  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(chainId);
    } catch {
      return null;
    }
  }, [chainId]);
  const switchChain = useSwitchChain();

  // Read asset ID from URL query parameter
  const [assetIdParam] = useQueryState(QueryParamKey.RESTAKE_ASSET_ID);

  // Try to use context first (if within RestakeProvider), fall back to hook
  const restakeContext = useOptionalRestakeContext();
  const directAssets = useRestakeAssets({ enabled: !restakeContext });

  // Use context data if available, otherwise use direct fetch
  const {
    assets,
    isLoading: isLoadingAssets,
    refetchBalances,
  } = restakeContext
    ? {
        assets: restakeContext.assets,
        isLoading: restakeContext.isLoadingAssets,
        refetchBalances: restakeContext.refetchBalances,
      }
    : directAssets;

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<EvmDepositFormFields>({
    mode: 'onChange',
    defaultValues: {
      sourceTypedChainId: getDefaultTypedChainId(activeTypedChainId),
      lockDuration: 'NONE',
    },
  });

  const setValue = useFormSetValue(setFormValue);

  useEffect(() => {
    register('depositAssetId', { required: 'Asset is required' });
    register('sourceTypedChainId', { required: 'Chain is required' });
    register('lockDuration', { required: true });
  }, [register]);

  useEffect(() => {
    setValue('sourceTypedChainId', getDefaultTypedChainId(activeTypedChainId));
  }, [activeTypedChainId, setValue]);

  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  useEffect(() => {
    if (assets === null || isLoadingAssets) {
      return;
    }

    // If asset ID is specified in URL and exists, use it
    if (assetIdParam) {
      const assetFromUrl = assets.get(assetIdParam.toLowerCase() as Address);
      if (assetFromUrl) {
        setValue('depositAssetId', assetFromUrl.id);
        return;
      }
    }

    // Fallback: select first asset with balance
    const defaultAsset = Array.from(assets.values()).find(
      ({ balance }) => balance !== null && balance > BigInt(0),
    );

    if (defaultAsset === undefined) {
      return;
    }

    setValue('depositAssetId', defaultAsset.id);
  }, [assets, setValue, isLoadingAssets, assetIdParam]);

  const {
    status: tokenModalOpen,
    close: closeTokenModal,
    open: openTokenModal,
    update: updateTokenModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  const allAssets = useMemo(() => {
    if (assets === null) {
      return [];
    }

    return Array.from(assets.values()).sort((a, b) => {
      const aBalance = a.balance ?? BigInt(0);
      const bBalance = b.balance ?? BigInt(0);

      if (aBalance === BigInt(0) && bBalance > BigInt(0)) return 1;
      if (bBalance === BigInt(0) && aBalance > BigInt(0)) return -1;
      if (aBalance > bBalance) return -1;
      if (aBalance < bBalance) return 1;
      return 0;
    });
  }, [assets]);

  const assetId = watch('depositAssetId');
  const amount = watch('amount');
  const lockDuration = watch('lockDuration');

  const asset = useMemo(() => {
    if (assets === null || assetId === undefined) {
      return null;
    }

    return assets.get(assetId) ?? null;
  }, [assetId, assets]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!asset || asset.balance === null) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const formatted = Number(
      formatUnits(asset.balance, asset.metadata.decimals),
    );

    return {
      maxAmount: asset.balance,
      formattedMaxAmount: formatted,
    };
  }, [asset]);

  const isNativeAsset = asset?.id?.toLowerCase() === zeroAddress;
  const spender = contracts?.multiAssetDelegation ?? null;

  const approveLastErrorRef = useRef<Error | null>(null);

  const {
    status: approveTxStatus,
    execute: executeApproveTx,
    txHash: approveTxHash,
  } = useContractWrite(
    erc20Abi,
    (ctx: { token: Address; spender: Address; amount: bigint }) => {
      if (ctx.token.toLowerCase() === zeroAddress) return null;

      return {
        address: ctx.token,
        abi: erc20Abi,
        functionName: 'approve' as const,
        args: [ctx.spender, ctx.amount] as const,
      };
    },
    {
      txName: 'approve',
      onError: (error) => {
        approveLastErrorRef.current = error;
      },
      getSuccessMessage: () => 'Approval successful',
    },
  );

  const [txStep, setTxStep] = useState<'idle' | 'approving' | 'depositing'>(
    'idle',
  );

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(asset?.metadata.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!asset) return 'Select an asset first';
          const parsed = parseUnits(value, asset.metadata.decimals);
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Insufficient balance';
          return true;
        },
      }),
    };
  }, [asset, maxAmount, register]);

  const displayError = useMemo(() => {
    return errors.depositAssetId !== undefined || !assetId
      ? 'Select Asset'
      : !amount
        ? 'Enter an amount'
        : errors.amount !== undefined
          ? 'Invalid amount'
          : undefined;
  }, [errors.depositAssetId, errors.amount, assetId, amount]);

  const handleAssetSelection = useCallback(
    (selectedAsset: RestakeAsset) => {
      setValue('depositAssetId', selectedAsset.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const isTransacting =
    isSubmitting ||
    depositTxStatus === TxStatus.PROCESSING ||
    approveTxStatus === TxStatus.PROCESSING;

  const isReady = executeDepositTx !== null && asset !== null && !isTransacting;

  const handleApprove = useCallback(
    async (amountToApprove: bigint) => {
      if (!asset || !spender || !executeApproveTx) {
        return false;
      }

      approveLastErrorRef.current = null;
      const firstAttempt = await executeApproveTx({
        token: asset.id,
        spender,
        amount: amountToApprove,
      });

      if (firstAttempt !== null) {
        return true;
      }

      // TS will narrow `ref.current` to `null` after assignment, even though the
      // async write may set it via `onError`. Widen it back for the post-attempt check.
      const message =
        (approveLastErrorRef.current as Error | null)?.message?.toLowerCase() ??
        '';
      const looksLikeNonZeroAllowanceIssue =
        message.includes('non-zero') && message.includes('allowance');

      if (!looksLikeNonZeroAllowanceIssue) {
        return false;
      }

      // Some ERC20s (e.g. USDT-style) require setting allowance to 0 before setting a new non-zero allowance.
      const zeroAttempt = await executeApproveTx({
        token: asset.id,
        spender,
        amount: BigInt(0),
      });

      if (zeroAttempt === null) {
        return false;
      }

      const secondAttempt = await executeApproveTx({
        token: asset.id,
        spender,
        amount: amountToApprove,
      });

      return secondAttempt !== null;
    },
    [asset, executeApproveTx, spender],
  );

  const onSubmit = useCallback<SubmitHandler<EvmDepositFormFields>>(
    async ({ amount, lockDuration }) => {
      if (!isReady || !asset) {
        return;
      }

      const amountBigInt = parseUnits(amount, asset.metadata.decimals);

      if (amountBigInt <= BigInt(0)) {
        return;
      }

      try {
        // For ERC20 deposits, set allowance to exactly the deposit amount (never infinite approvals).
        if (!isNativeAsset) {
          if (!spender) return;
          setTxStep('approving');
          const approved = await handleApprove(amountBigInt);
          if (!approved) return;
        }

        setTxStep('depositing');
        await executeDepositTx({
          token: asset.id,
          amount: amountBigInt,
          lockDuration,
        });
      } finally {
        setTxStep('idle');
      }

      setValue('amount', '', { shouldValidate: false });
      setValue('depositAssetId', undefined as unknown as Address, {
        shouldValidate: false,
      });

      refetchBalances();
    },
    [
      asset,
      executeDepositTx,
      handleApprove,
      isNativeAsset,
      isReady,
      spender,
      refetchBalances,
      setValue,
    ],
  );

  const lockOptions = useMemo(
    () =>
      [
        { id: 'NONE', label: 'No lock' },
        { id: 'ONE_MONTH', label: '1 month' },
        { id: 'TWO_MONTHS', label: '2 months' },
        { id: 'THREE_MONTHS', label: '3 months' },
        { id: 'SIX_MONTHS', label: '6 months' },
      ] satisfies ReadonlyArray<{ id: LockDuration; label: string }>,
    [],
  );

  const selectedLockOption = useMemo(() => {
    return (
      lockOptions.find((option) => option.id === lockDuration) ?? lockOptions[0]
    );
  }, [lockDuration, lockOptions]);

  return (
    <StyleContainer>
      <RestakeActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root
              tokenSymbol={asset?.metadata.symbol}
              className="bg-mono-20 dark:bg-mono-180"
            >
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Connecting"
                  disabled
                  {...(activeChain
                    ? {
                        renderBody: () => (
                          <div className="flex items-center gap-2">
                            <ChainIcon size="lg" name={activeChain.name} />

                            <Typography
                              variant="h5"
                              fw="bold"
                              className="text-mono-200 dark:text-mono-0"
                            >
                              {activeChain.name}
                            </Typography>
                          </div>
                        ),
                      }
                    : {})}
                />
                <TransactionInputCard.MaxAmountButton
                  maxAmount={formattedMaxAmount}
                  tooltipBody="Available Balance"
                  Icon={
                    useRef({
                      enabled: <LockLineIcon />,
                      disabled: <LockFillIcon />,
                    }).current
                  }
                  onClick={() => {
                    if (formattedMaxAmount !== undefined) {
                      setValue('amount', formattedMaxAmount.toString(), {
                        shouldValidate: true,
                      });
                    }
                  }}
                />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                customAmountProps={customAmountProps}
                tokenSelectorProps={
                  useRef({
                    placeholder: <AssetPlaceholder />,
                    onClick: openTokenModal,
                    ...(asset
                      ? {
                          renderBody: () => (
                            <div className="flex items-center gap-2">
                              <TokenIcon
                                name={asset.metadata.symbol}
                                size="lg"
                              />
                              <Typography variant="h5" fw="bold">
                                {asset.metadata.symbol}
                              </Typography>
                            </div>
                          ),
                        }
                      : {}),
                  }).current
                }
              />
            </TransactionInputCard.Root>

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </div>

          <DropdownField
            title="Lock"
            items={lockOptions}
            selectedItem={selectedLockOption}
            setSelectedItemId={(value) =>
              setValue('lockDuration', value as LockDuration)
            }
            getDisplayText={(option) => option.label}
            getId={(option) => option.id}
          />

          <Details />

          <ActionButtonBase>
            {(isLoading, loadingText) => {
              const activeChainSupported =
                isDefined(activeTypedChainId) &&
                SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(
                  activeTypedChainId,
                );

              if (!activeChainSupported) {
                return (
                  <Button
                    isFullWidth
                    type="button"
                    isLoading={isLoading}
                    loadingText={loadingText}
                    onClick={openChainModal}
                  >
                    Switch to supported chain
                  </Button>
                );
              }

              return (
                <Button
                  isDisabled={!isValid || isDefined(displayError) || !isReady}
                  type="submit"
                  isFullWidth
                  isLoading={isTransacting || isLoading}
                  loadingText={
                    txStep === 'approving' &&
                    approveTxStatus === TxStatus.PROCESSING
                      ? approveTxHash === null
                        ? 'Preparing approval…'
                        : 'Waiting for approval…'
                      : txStep === 'depositing' &&
                          depositTxStatus === TxStatus.PROCESSING
                        ? depositTxHash === null
                          ? 'Preparing deposit…'
                          : 'Waiting for deposit…'
                        : loadingText
                  }
                >
                  {displayError ??
                    (isNativeAsset ? 'Deposit' : 'Approve & Deposit')}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
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
        renderItem={(assetItem) => (
          <AssetListItem
            assetId={assetItem.id}
            name={assetItem.metadata.name}
            symbol={assetItem.metadata.symbol}
            balance={new BN((assetItem.balance ?? BigInt(0)).toString())}
            decimals={assetItem.metadata.decimals}
          />
        )}
      />

      <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
        <SupportedChainModal
          onClose={closeChainModal}
          onChainChange={async (chainConfig) => {
            const typedChainId = calculateTypedChainId(
              chainConfig.chainType,
              chainConfig.id,
            );

            await switchChain(typedChainId);
            closeChainModal();
          }}
        />
      </Modal>
    </StyleContainer>
  );
};

export default DepositForm;
