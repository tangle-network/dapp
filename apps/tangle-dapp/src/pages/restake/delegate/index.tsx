import { ChainConfig } from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import {
  Avatar,
  Card,
  isEvmAddress,
  shortenHex,
  Typography,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useFormSetValue from '../../../hooks/useFormSetValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address, formatUnits, parseUnits } from 'viem';
import { BN } from '@polkadot/util';
import { useAccount, useChainId, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
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
import AssetListItem from '../../../components/Lists/AssetListItem';
import OperatorListItem from '../../../components/Lists/OperatorListItem';

import {
  useOperatorMap,
  useRestakeAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useDelegateTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';

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
  delegationCount: bigint;
  isActive: boolean;
};

const RestakeDelegateForm: FC = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
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

  const setValue = useFormSetValue(setFormValue);

  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAddress', { required: 'Operator is required' });
  }, [register]);

  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  const { assets: restakeAssets } = useRestakeAssets({
    enabled: Boolean(userAddress),
  });
  const { data: operatorMap } = useOperatorMap();
  const blueprintSelection = useBlueprintStore((store) => store.selection);

  const tokenAddresses = useMemo(() => {
    if (!restakeAssets) return [];
    return Array.from(restakeAssets.keys());
  }, [restakeAssets]);

  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  const publicClient = usePublicClient({ chainId });

  // Fetch deposit amounts from getDeposit
  const { data: depositAmountMap, refetch: refetchDeposits } = useQuery({
    queryKey: [
      'restake',
      'delegate',
      'deposits',
      chainId,
      userAddress,
      tokenAddresses.map((t) => t.toLowerCase()).sort(),
    ],
    queryFn: async () => {
      const map = new Map<string, bigint>();

      if (!publicClient || !contracts || !userAddress) {
        return map;
      }

      const results = await Promise.allSettled(
        tokenAddresses.map(async (token) => {
          const deposit = (await publicClient.readContract({
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'getDeposit',
            args: [userAddress, token],
          })) as { amount: bigint; delegatedAmount: bigint };

          return { token, amount: deposit.amount };
        }),
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { token, amount } = result.value;
          map.set(token.toLowerCase(), amount);
        }
      }

      return map;
    },
    enabled:
      Boolean(publicClient) &&
      Boolean(contracts) &&
      Boolean(userAddress) &&
      tokenAddresses.length > 0,
    staleTime: 2_000,
    refetchInterval: 2_000,
    refetchIntervalInBackground: true,
    retry: 2,
  });

  // Fetch actual delegated amounts from getDelegations (getDeposit.delegatedAmount is not reliable)
  const { data: delegatedAmountMap, refetch: refetchDelegations } = useQuery({
    queryKey: ['restake', 'delegate', 'delegations', chainId, userAddress],
    queryFn: async () => {
      const map = new Map<string, bigint>();

      if (!publicClient || !contracts || !userAddress) {
        return map;
      }

      type DelegationInfo = {
        operator: Address;
        shares: bigint;
        asset: { kind: number; token: Address };
        selectionMode: number;
      };

      const delegations = (await publicClient.readContract({
        address: contracts.multiAssetDelegation,
        abi: MULTI_ASSET_DELEGATION_ABI,
        functionName: 'getDelegations',
        args: [userAddress],
      })) as DelegationInfo[];

      // Sum shares by token to get total delegated amount per token
      for (const delegation of delegations) {
        const tokenKey = delegation.asset.token.toLowerCase();
        const existing = map.get(tokenKey) ?? BigInt(0);
        map.set(tokenKey, existing + delegation.shares);
      }

      return map;
    },
    enabled:
      Boolean(publicClient) && Boolean(contracts) && Boolean(userAddress),
    staleTime: 2_000,
    refetchInterval: 2_000,
    refetchIntervalInBackground: true,
    retry: 2,
  });

  // Combine deposit and delegation data
  const depositMap = useMemo(() => {
    const map = new Map<string, { amount: bigint; delegatedAmount: bigint }>();

    if (!depositAmountMap) return map;

    for (const [token, amount] of depositAmountMap.entries()) {
      const delegatedAmount = delegatedAmountMap?.get(token) ?? BigInt(0);
      map.set(token, { amount, delegatedAmount });
    }

    return map;
  }, [depositAmountMap, delegatedAmountMap]);

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
    if (!restakeAssets || !depositMap) {
      return [];
    }

    return tokenAddresses
      .map((token) => {
        const asset = restakeAssets.get(token);
        const deposit = depositMap.get(token.toLowerCase());

        if (!asset || !deposit) {
          return null;
        }

        const totalDeposited = deposit.amount;
        const delegatedAmount = deposit.delegatedAmount;
        const availableBalance = totalDeposited - delegatedAmount;

        if (availableBalance <= BigInt(0)) {
          return null;
        }

        return {
          id: token,
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          decimals: asset.metadata.decimals,
          balance: totalDeposited,
          delegatedAmount,
          availableBalance,
        };
      })
      .filter((item): item is AssetItem => item !== null);
  }, [depositMap, restakeAssets, tokenAddresses]);

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
        delegationCount: op.restakingDelegationCount ?? BigInt(0),
        isActive: true,
      }));
  }, [operatorMap]);

  const selectedOperator = useMemo(() => {
    if (!selectedOperatorAddress || !operatorMap) return null;
    return operatorMap.get(selectedOperatorAddress as Address) ?? null;
  }, [operatorMap, selectedOperatorAddress]);

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
        await Promise.all([refetchDeposits(), refetchDelegations()]);
        resetForm();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    },
    [
      blueprintSelection,
      executeDelegateTx,
      isReady,
      refetchDeposits,
      refetchDelegations,
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
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="md"
                              theme="ethereum"
                              value={selectedOperatorAddress}
                            />
                            <div className="flex flex-col">
                              <Typography
                                variant="h5"
                                fw="bold"
                                component="span"
                                className="inline-block text-mono-200 dark:text-mono-40"
                              >
                                {shortenHex(selectedOperatorAddress)}
                              </Typography>
                              <Typography
                                variant="body3"
                                component="span"
                                className="text-mono-120 dark:text-mono-100"
                              >
                                {typeof selectedOperator?.restakingDelegationCount ===
                                'bigint'
                                  ? `${selectedOperator.restakingDelegationCount.toString()} total delegations`
                                  : 'Operator'}
                              </Typography>
                            </div>
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
                              <TokenIcon
                                name={selectedAssetItem.symbol}
                                size="lg"
                              />
                              <Typography variant="h5" fw="bold">
                                {selectedAssetItem.symbol}
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
          <AssetListItem
            assetId={asset.id}
            name={asset.name}
            symbol={asset.symbol}
            balance={new BN(asset.availableBalance.toString())}
            decimals={asset.decimals}
            rightBottomText="Available"
          />
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
          <OperatorListItem
            accountAddress={address}
            totalDelegations={delegationCount}
          />
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
