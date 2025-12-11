import { ChainConfig } from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card, isEvmAddress } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address, formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import ErrorMessage from '../../../components/ErrorMessage';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import BlueprintSelection from '../../../components/restaking/BlueprintSelection';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useBlueprintStore from '../../../context/useBlueprintStore';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { EvmDelegationFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import AssetPlaceholder from '../AssetPlaceholder';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';

import {
  useDelegator,
  useOperatorMap,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegateTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

type AssetItem = {
  id: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  delegatedAmount: bigint;
  availableBalance: bigint;
};

type OperatorItem = {
  address: Address;
  stake: bigint;
  delegationCount: number;
  isActive: boolean;
};

const RestakeDelegateForm: FC = () => {
  const { address: userAddress } = useAccount();
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EvmDelegationFormFields>({
    mode: 'onChange',
  });

  const selectedOperatorAddress = watch('operatorAddress');
  const selectedAssetId = watch('assetId');
  const amount = watch('amount');

  const [operatorParam, setOperatorParam] = useQueryState(
    QueryParamKey.RESTAKE_OPERATOR,
  );

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
    register('assetId', { required: 'Asset is required' });
    register('operatorAddress', { required: 'Operator is required' });
  }, [register]);

  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  const { data: delegator } = useDelegator(userAddress);
  const { data: operatorMap } = useOperatorMap();
  const blueprintSelection = useBlueprintStore((store) => store.selection);

  const tokenAddresses = useMemo(() => {
    if (!delegator?.assetPositions) return [];
    return delegator.assetPositions.map((pos) => pos.token);
  }, [delegator?.assetPositions]);

  const { data: tokenMetadatas } = useEvmAssetMetadatas(
    tokenAddresses as EvmAddress[],
  );

  const { status: delegateTxStatus, execute: executeDelegateTx } =
    useDelegateTx();

  useEffect(() => {
    if (
      !operatorParam ||
      typeof operatorParam !== 'string' ||
      !isEvmAddress(operatorParam) ||
      !operatorMap?.get(operatorParam as Address)
    ) {
      return;
    }

    setFormValue('operatorAddress', operatorParam as Address);
    setOperatorParam(null);
  }, [operatorMap, operatorParam, setFormValue, setOperatorParam]);

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal(false);

  const {
    status: isAssetModalOpen,
    open: openAssetModal,
    close: closeAssetModal,
    update: updateAssetModal,
  } = useModal(false);

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
    update: updateOperatorModal,
  } = useModal(false);

  const [selectedAssetItem, setSelectedAssetItem] = useState<AssetItem | null>(
    null,
  );

  const depositedAssets = useMemo<AssetItem[]>(() => {
    if (!delegator?.assetPositions || !tokenMetadatas) {
      return [];
    }

    return delegator.assetPositions
      .map((position) => {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === position.token.toLowerCase(),
        );

        if (!metadata) {
          return null;
        }

        const availableBalance =
          position.totalDeposited - position.delegatedAmount;

        if (availableBalance <= BigInt(0)) {
          return null;
        }

        return {
          id: position.token,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          balance: position.totalDeposited,
          delegatedAmount: position.delegatedAmount,
          availableBalance,
        };
      })
      .filter((item): item is AssetItem => item !== null);
  }, [delegator?.assetPositions, tokenMetadatas]);

  useEffect(() => {
    if (depositedAssets.length > 0 && !selectedAssetItem) {
      const firstAsset = depositedAssets[0];
      setValue('assetId', firstAsset.id);
      setSelectedAssetItem(firstAsset);
    }
  }, [depositedAssets, setValue, selectedAssetItem]);

  const handleAssetSelect = useCallback(
    (asset: AssetItem) => {
      setValue('assetId', asset.id);
      setSelectedAssetItem(asset);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

  const handleChainChange = useCallback(
    async (chain: ChainConfig) => {
      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);

      await switchChain(typedChainId);
      closeChainModal();
    },
    [closeChainModal, switchChain],
  );

  const operators = useMemo<OperatorItem[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.entries())
      .filter(([, op]) => op.restakingStatus === 'ACTIVE')
      .map(([address, op]) => ({
        address,
        stake: op.restakingStake ?? BigInt(0),
        delegationCount: Number(op.restakingDelegationCount ?? BigInt(0)),
        isActive: true,
      }));
  }, [operatorMap]);

  const handleOnSelectOperator = useCallback(
    (operator: OperatorItem) => {
      setValue('operatorAddress', operator.address);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!selectedAssetItem) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const formatted = Number(
      formatUnits(
        selectedAssetItem.availableBalance,
        selectedAssetItem.decimals,
      ),
    );

    return {
      maxAmount: selectedAssetItem.availableBalance,
      formattedMaxAmount: formatted,
    };
  }, [selectedAssetItem]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAssetItem?.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!selectedAssetItem) return 'Select an asset first';
          const parsed = parseUnits(value, selectedAssetItem.decimals);
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Insufficient balance';
          return true;
        },
      }),
    };
  }, [maxAmount, register, selectedAssetItem]);

  const displayError = useMemo(() => {
    return errors.operatorAddress !== undefined || !selectedOperatorAddress
      ? 'Select Operator'
      : errors.assetId !== undefined || !selectedAssetId
        ? 'Select Asset'
        : !amount
          ? 'Enter Amount'
          : errors.amount !== undefined
            ? 'Invalid Amount'
            : undefined;
  }, [
    errors.operatorAddress,
    errors.assetId,
    errors.amount,
    selectedOperatorAddress,
    selectedAssetId,
    amount,
  ]);

  const isTransacting =
    isSubmitting || delegateTxStatus === TxStatus.PROCESSING;

  const isReady =
    !isTransacting && selectedAssetItem !== null && executeDelegateTx !== null;

  const resetForm = useCallback(() => {
    setValue('amount', '', { shouldValidate: false });
    setValue('assetId', '' as Address, { shouldValidate: false });
    setValue('operatorAddress', '' as Address, { shouldValidate: false });
    setSelectedAssetItem(null);
  }, [setValue]);

  const onSubmit = useCallback<SubmitHandler<EvmDelegationFormFields>>(
    async ({ amount, assetId, operatorAddress }) => {
      if (!isReady || !selectedAssetItem) {
        return;
      }

      const amountBigInt = parseUnits(amount, selectedAssetItem.decimals);

      if (amountBigInt <= BigInt(0)) {
        return;
      }

      try {
        await executeDelegateTx({
          operator: operatorAddress,
          token: assetId,
          amount: amountBigInt,
          blueprintSelection: blueprintSelection.length > 0 ? 'FIXED' : 'ALL',
          blueprintIds: blueprintSelection.map((id) => BigInt(id)),
        });
        resetForm();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    },
    [
      blueprintSelection,
      executeDelegateTx,
      isReady,
      resetForm,
      selectedAssetItem,
    ],
  );

  return (
    <StyleContainer>
      <RestakeActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root
              tokenSymbol={selectedAssetItem?.symbol}
              className="bg-mono-20 dark:bg-mono-180"
            >
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Operator"
                  onClick={openOperatorModal}
                  {...(selectedOperatorAddress
                    ? {
                        renderBody: () => (
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {selectedOperatorAddress.slice(0, 8)}...
                              {selectedOperatorAddress.slice(-6)}
                            </span>
                            <span className="text-xs text-mono-100">
                              Operator
                            </span>
                          </div>
                        ),
                      }
                    : {})}
                />
                <TransactionInputCard.MaxAmountButton
                  maxAmount={formattedMaxAmount}
                  tooltipBody="Available to Delegate"
                  Icon={
                    useRef({
                      enabled: <LockUnlockLineIcon />,
                      disabled: <LockUnlockLineIcon />,
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
                    onClick: openAssetModal,
                    ...(selectedAssetItem && formattedMaxAmount !== undefined
                      ? {
                          renderBody: () => (
                            <div className="flex items-center gap-2">
                              <Typography variant="h5" fw="bold">
                                {selectedAssetItem.symbol}
                              </Typography>
                              <div className="flex flex-col gap-1">
                                <Typography
                                  variant="body2"
                                  className="text-mono-120 dark:text-mono-100"
                                >
                                  Available: {formattedMaxAmount}{' '}
                                  {selectedAssetItem.symbol}
                                </Typography>
                              </div>
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

          <BlueprintSelection operatorAddress={selectedOperatorAddress} />

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
                  {displayError ?? 'Delegate'}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </Card>

      <ListModal
        title="Select Asset"
        isOpen={isAssetModalOpen}
        setIsOpen={updateAssetModal}
        titleWhenEmpty="No Assets Available"
        descriptionWhenEmpty="Have you made a deposit on this network yet?"
        items={depositedAssets}
        searchInputId="restake-delegate-asset-search"
        searchPlaceholder="Search assets..."
        getItemKey={(item) => item.id}
        onSelect={handleAssetSelect}
        filterItem={(item, query) =>
          filterBy(query, [item.name, item.symbol, item.id])
        }
        renderItem={(asset) => (
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-medium">{asset.symbol}</span>
              <span className="text-xs text-mono-100">{asset.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {formatUnits(asset.availableBalance, asset.decimals)}
              </span>
              <span className="text-xs text-mono-100">Available</span>
            </div>
          </div>
        )}
      />

      <ListModal
        title="Select Operator"
        isOpen={isOperatorModalOpen}
        setIsOpen={updateOperatorModal}
        titleWhenEmpty="No Operators Available"
        descriptionWhenEmpty="Looks like there aren't any registered operators in this network yet."
        items={operators}
        searchInputId="restake-delegate-operator-search"
        searchPlaceholder="Search operators..."
        getItemKey={(item) => item.address}
        onSelect={handleOnSelectOperator}
        filterItem={(item, query) => filterBy(query, [item.address])}
        renderItem={({ address, delegationCount }) => (
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-mono text-sm">
                {address.slice(0, 10)}...{address.slice(-8)}
              </span>
              <span className="text-xs text-mono-100">
                {delegationCount} delegations
              </span>
            </div>
          </div>
        )}
      />

      <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
        <SupportedChainModal
          onClose={closeChainModal}
          onChainChange={handleChainChange}
        />
      </Modal>
    </StyleContainer>
  );
};

export default RestakeDelegateForm;
