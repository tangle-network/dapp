import {
  ChainConfig,
} from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import {
  Card,
  isEvmAddress,
} from '@tangle-network/ui-components';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address, formatUnits, parseUnits } from 'viem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { EvmDelegationFormFields } from '../../../types/restake';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import Form from '../Form';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import Details from './Details';
import BlueprintSelection from '../../../components/restaking/BlueprintSelection';
import useBlueprintStore from '../../../context/useBlueprintStore';

// EVM hooks
import {
  useDelegator,
  useOperatorMap,
  type Operator,
  type DelegatorAssetPosition,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegateTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { useRestakingAssetMap } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useAccount } from 'wagmi';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';

// Asset item for selection
type AssetItem = {
  id: Address;
  name: string;
  symbol: string;
  decimals: number;
  balance: bigint;
  delegatedAmount: bigint;
  availableBalance: bigint; // balance - delegated
};

// Operator item for selection
type OperatorItem = {
  address: Address;
  stake: bigint;
  delegationCount: number;
  isActive: boolean;
};

const RestakeDelegateForm: FC = () => {
  const { address: userAddress } = useAccount();
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EvmDelegationFormFields>({
    mode: 'onChange',
  });

  const selectedOperatorAddress = watch('operatorAddress');

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

  // Register select fields on mount.
  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAddress', { required: 'Operator is required' });
  }, [register]);

  // Fetch data using v2 hooks
  const { data: delegator, isLoading: isLoadingDelegator } = useDelegator(userAddress);
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap();
  const { data: restakingAssetMap } = useRestakingAssetMap();
  const blueprintSelection = useBlueprintStore((store) => store.selection);

  // Get token addresses for metadata fetch
  const tokenAddresses = useMemo(() => {
    if (!delegator?.assetPositions) return [];
    return delegator.assetPositions.map((pos) => pos.token);
  }, [delegator?.assetPositions]);

  // Fetch token metadata
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses as EvmAddress[]);

  const switchChain = useSwitchChain();
  const { status: delegateTxStatus, execute: executeDelegateTx } = useDelegateTx();

  // Set the operatorAddress from the URL param.
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

    // Remove the param to prevent reuse after initial load.
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

  const [selectedAssetItem, setSelectedAssetItem] = useState<AssetItem | null>(null);

  // Build deposited assets list from delegator positions
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

        const availableBalance = position.totalDeposited - position.delegatedAmount;

        // Only show assets with available balance
        if (availableBalance <= 0n) {
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

  // Set default asset
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

  const selectedAssetId = watch('assetId');

  const isReady =
    !isSubmitting &&
    selectedAssetItem !== null &&
    executeDelegateTx !== null &&
    delegateTxStatus !== TxStatus.PROCESSING;

  const onSubmit = useCallback<SubmitHandler<EvmDelegationFormFields>>(
    async ({ amount, assetId, operatorAddress }) => {
      if (!isReady || !selectedAssetItem) {
        return;
      }

      const amountBigInt = parseUnits(amount, selectedAssetItem.decimals);

      if (amountBigInt <= 0n) {
        return;
      }

      await executeDelegateTx({
        operator: operatorAddress,
        token: assetId,
        amount: amountBigInt,
        blueprintSelection: blueprintSelection.length > 0 ? 'FIXED' : 'ALL',
        blueprintIds: blueprintSelection.map((id) => BigInt(id)),
      });

      setValue('operatorAddress', '' as Address, { shouldValidate: false });
      setValue('amount', '', { shouldValidate: false });
      setValue('assetId', '' as Address, { shouldValidate: false });
      setSelectedAssetItem(null);
    },
    [
      blueprintSelection,
      executeDelegateTx,
      isReady,
      selectedAssetItem,
      setValue,
    ],
  );

  // Build operators list
  const operators = useMemo<OperatorItem[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.entries())
      .filter(([, op]) => op.status === 'ACTIVE')
      .map(([address, op]) => ({
        address,
        stake: op.stake,
        delegationCount: op.delegationCount,
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

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeActionTabs />

      <Card withShadow tightPadding>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full gap-4 grow">
            <div className="flex flex-col gap-2">
              {/* Operator Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-mono-140 dark:text-mono-80">
                  Operator
                </label>
                <button
                  type="button"
                  onClick={openOperatorModal}
                  className="w-full px-4 py-3 text-left border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-60 dark:border-mono-140 hover:bg-mono-20 dark:hover:bg-mono-160"
                >
                  {selectedOperatorAddress ? (
                    <span className="font-mono text-sm">
                      {selectedOperatorAddress.slice(0, 8)}...{selectedOperatorAddress.slice(-6)}
                    </span>
                  ) : (
                    <span className="text-mono-100">Select an operator</span>
                  )}
                </button>
                {errors.operatorAddress && (
                  <p className="text-xs text-red-50">{errors.operatorAddress.message}</p>
                )}
              </div>

              {/* Asset Selection & Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-mono-140 dark:text-mono-80">
                    Amount
                  </label>
                  {selectedAssetItem && (
                    <button
                      type="button"
                      onClick={() => {
                        const maxAmount = formatUnits(
                          selectedAssetItem.availableBalance,
                          selectedAssetItem.decimals,
                        );
                        setValue('amount', maxAmount);
                      }}
                      className="text-xs text-blue-50 hover:text-blue-40"
                    >
                      Max: {formatUnits(selectedAssetItem.availableBalance, selectedAssetItem.decimals)} {selectedAssetItem.symbol}
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    {...register('amount', {
                      required: 'Amount is required',
                      validate: (value) => {
                        if (!selectedAssetItem) return 'Select an asset first';
                        const parsed = parseUnits(value, selectedAssetItem.decimals);
                        if (parsed <= 0n) return 'Amount must be greater than 0';
                        if (parsed > selectedAssetItem.availableBalance) return 'Insufficient balance';
                        return true;
                      },
                    })}
                    type="text"
                    placeholder="0.0"
                    className="flex-1 px-3 py-2 border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-60 dark:border-mono-140"
                  />

                  <button
                    type="button"
                    onClick={openAssetModal}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-60 dark:border-mono-140 hover:bg-mono-20 dark:hover:bg-mono-160"
                  >
                    {selectedAssetItem ? (
                      <span className="font-medium">{selectedAssetItem.symbol}</span>
                    ) : (
                      <span className="text-mono-100">Select token</span>
                    )}
                  </button>
                </div>

                {errors.amount && (
                  <p className="text-xs text-red-50">{errors.amount.message}</p>
                )}
              </div>

              <BlueprintSelection operatorAddress={selectedOperatorAddress} />
            </div>

            <div className="flex flex-col justify-between gap-4 grow">
              <Details />

              <DelegateActionButton
                errors={errors}
                isValid={isValid && isReady}
                openChainModal={openChainModal}
                isSubmitting={
                  isSubmitting || delegateTxStatus === TxStatus.PROCESSING
                }
              />
            </div>
          </div>

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
            filterItem={(item, query) =>
              filterBy(query, [item.address])
            }
            renderItem={({ address, stake, delegationCount }) => (
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
        </Form>
      </Card>
    </StyleContainer>
  );
};

// EVM Action Button
interface DelegateActionButtonProps {
  errors: ReturnType<typeof useForm<EvmDelegationFormFields>>['formState']['errors'];
  isValid: boolean;
  openChainModal: () => void;
  isSubmitting: boolean;
}

const DelegateActionButton: FC<DelegateActionButtonProps> = ({
  errors,
  isValid,
  openChainModal,
  isSubmitting,
}) => {
  const displayError =
    errors.operatorAddress !== undefined
      ? 'Select Operator'
      : errors.assetId !== undefined
        ? 'Select Asset'
        : errors.amount !== undefined
          ? 'Enter Amount'
          : undefined;

  return (
    <button
      type="submit"
      disabled={!isValid || displayError !== undefined || isSubmitting}
      className="w-full px-4 py-3 font-medium text-white rounded-lg bg-blue-50 hover:bg-blue-40 disabled:bg-mono-80 disabled:cursor-not-allowed"
    >
      {isSubmitting ? 'Delegating...' : displayError ?? 'Delegate'}
    </button>
  );
};

export default RestakeDelegateForm;
