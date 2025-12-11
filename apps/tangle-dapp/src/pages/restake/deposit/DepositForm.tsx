import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { ChainIcon } from '@tangle-network/icons/ChainIcon';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { parseUnits, Address, formatUnits } from 'viem';
import { useChainId } from 'wagmi';
import ErrorMessage from '../../../components/ErrorMessage';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { EvmDepositFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import AssetPlaceholder from '../AssetPlaceholder';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import {
  useRestakeAssets,
  type RestakeAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDepositTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { chainsConfig } from '@tangle-network/dapp-config/chains';

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

  const { status: depositTxStatus, execute: executeDepositTx } = useDepositTx();
  const switchChain = useSwitchChain();

  const {
    assets,
    isLoading: isLoadingAssets,
    refetchBalances,
  } = useRestakeAssets();

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

  useEffect(() => {
    register('depositAssetId', { required: 'Asset is required' });
    register('sourceTypedChainId', { required: 'Chain is required' });
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
      if (a.balance === BigInt(0) && b.balance > BigInt(0)) return 1;
      if (b.balance === BigInt(0) && a.balance > BigInt(0)) return -1;
      if (a.balance > b.balance) return -1;
      if (a.balance < b.balance) return 1;
      return 0;
    });
  }, [assets]);

  const assetId = watch('depositAssetId');
  const amount = watch('amount');

  const asset = useMemo(() => {
    if (assets === null || assetId === undefined) {
      return null;
    }

    return assets.get(assetId) ?? null;
  }, [assetId, assets]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!asset) {
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

  const isTransacting = isSubmitting || depositTxStatus === TxStatus.PROCESSING;

  const isReady = executeDepositTx !== null && asset !== null && !isTransacting;

  const onSubmit = useCallback<SubmitHandler<EvmDepositFormFields>>(
    async ({ amount }) => {
      if (!isReady || !asset) {
        return;
      }

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

      refetchBalances();
    },
    [asset, isReady, refetchBalances, executeDepositTx, setValue],
  );

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
                            <Typography variant="h5" fw="bold">
                              {asset.metadata.symbol}
                            </Typography>
                          ),
                        }
                      : {}),
                  }).current
                }
              />
            </TransactionInputCard.Root>

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </div>

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
                  loadingText={loadingText}
                >
                  {displayError ?? 'Deposit'}
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
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-medium">{assetItem.metadata.symbol}</span>
              <span className="text-xs text-mono-100">
                {assetItem.metadata.name}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {formatUnits(assetItem.balance, assetItem.metadata.decimals)}
              </span>
              <span className="text-xs text-mono-100">Balance</span>
            </div>
          </div>
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
