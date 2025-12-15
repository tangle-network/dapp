import { Cross1Icon } from '@radix-ui/react-icons';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import {
  Avatar,
  Card,
  IconButton,
  shortenHex,
} from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { Address, formatUnits, parseUnits } from 'viem';
import { BN } from '@polkadot/util';
import { useAccount, useChainId } from 'wagmi';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { EvmUnstakeFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';

// EVM hooks
import {
  useDelegator,
  useProtocolConfig,
  type UnstakeRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useExecuteUnstakeTx,
  useScheduleUnstakeTx,
} from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import LogoListItem from '../../../components/Lists/LogoListItem';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useResilientReadContract } from '@tangle-network/tangle-shared-ui/hooks/useResilientReadContract';
import { useResilientReadContracts } from '@tangle-network/tangle-shared-ui/hooks/useResilientReadContracts';

// Delegation item with metadata for selection
type DelegationItem = {
  id: string;
  operatorAddress: Address;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  shares: bigint;
  lastKnownAmount: bigint;
  availableToUnstake: bigint; // amount available to schedule (safe max at current exchange rate)
};

const RestakeUnstakeForm: FC = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const [isUnstakeRequestTableOpen, setIsUnstakeRequestTableOpen] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isSubmitting },
    watch,
  } = useForm<EvmUnstakeFormFields>({
    mode: 'onChange',
  });

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();

  const {
    status: isDelegationModalOpen,
    open: openDelegationModal,
    close: closeDelegationModal,
    update: setIsDelegationModalOpen,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  // Register form fields on mount
  useEffect(() => {
    register('operatorAddress', { required: true });
    register('assetId', { required: true });
  }, [register]);

  // Reset form when active chain changes
  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  // Fetch delegator data
  const { data: delegator, refetch: refetchDelegator } =
    useDelegator(userAddress);
  const { data: protocolConfig } = useProtocolConfig();

  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  type OnChainDelegation = {
    operator: Address;
    shares: bigint;
    asset: { kind: number; token: Address };
    selectionMode: number;
  };

  type OnChainPendingUnstake = {
    operator: Address;
    asset: { kind: number; token: Address };
    shares: bigint;
    requestedRound: bigint;
    selectionMode: number;
  };

  const { data: onChainDelegations, refetch: refetchOnChainDelegations } =
    useResilientReadContract({
      queryKey: [
        'restake',
        'unstake',
        'delegations',
        chainId,
        userAddress,
      ] as const,
      contract:
        contracts && userAddress
          ? {
              address: contracts.multiAssetDelegation,
              abi: MULTI_ASSET_DELEGATION_ABI,
              functionName: 'getDelegations',
              args: [userAddress] as const,
            }
          : null,
      query: {
        enabled: Boolean(contracts) && Boolean(userAddress),
        staleTime: 2_000,
        refetchInterval: 2_000,
        refetchIntervalInBackground: true,
      },
    });

  const {
    data: onChainPendingUnstakes,
    refetch: refetchOnChainPendingUnstakes,
  } = useResilientReadContract({
    queryKey: [
      'restake',
      'unstake',
      'pendingUnstakes',
      chainId,
      userAddress,
    ] as const,
    contract:
      contracts && userAddress
        ? {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'getPendingUnstakes',
            args: [userAddress] as const,
          }
        : null,
    query: {
      enabled: Boolean(contracts) && Boolean(userAddress),
      staleTime: 2_000,
      refetchInterval: 2_000,
      refetchIntervalInBackground: true,
    },
  });

  const delegationsForUi = useMemo(() => {
    const graphql = delegator?.delegations ?? [];
    const onchain =
      (onChainDelegations as OnChainDelegation[] | undefined) ?? [];

    const byKey = new Map<
      string,
      {
        id: string;
        operatorId: Address;
        token: Address;
        shares: bigint;
        lastKnownAmount: bigint;
      }
    >();

    for (const d of graphql) {
      const key = `${d.operatorId.toLowerCase()}-${d.token.toLowerCase()}`;
      byKey.set(key, {
        id: d.id,
        operatorId: d.operatorId,
        token: d.token,
        shares: d.shares,
        lastKnownAmount: d.lastKnownAmount,
      });
    }

    for (const [idx, d] of onchain.entries()) {
      const key = `${d.operator.toLowerCase()}-${d.asset.token.toLowerCase()}`;
      const prev = byKey.get(key);
      byKey.set(key, {
        id: prev?.id ?? `${key}-${idx}`,
        operatorId: d.operator,
        token: d.asset.token,
        shares: d.shares,
        lastKnownAmount: prev?.lastKnownAmount ?? d.shares,
      });
    }

    return Array.from(byKey.values());
  }, [delegator?.delegations, onChainDelegations]);

  const pendingUnstakeSharesByDelegationKey = useMemo(() => {
    const map = new Map<string, bigint>();

    if (delegator?.unstakeRequests && delegator.unstakeRequests.length > 0) {
      for (const req of delegator.unstakeRequests) {
        if (req.status !== 'PENDING') continue;
        const key = `${req.operatorId.toLowerCase()}-${req.token.toLowerCase()}`;
        map.set(key, (map.get(key) ?? BigInt(0)) + req.shares);
      }
      return map;
    }

    if (!onChainPendingUnstakes) {
      return map;
    }

    for (const req of onChainPendingUnstakes as OnChainPendingUnstake[]) {
      const key = `${req.operator.toLowerCase()}-${req.asset.token.toLowerCase()}`;
      map.set(key, (map.get(key) ?? BigInt(0)) + req.shares);
    }

    return map;
  }, [delegator?.unstakeRequests, onChainPendingUnstakes]);

  const operatorAddresses = useMemo(() => {
    if (delegationsForUi.length === 0) return [];
    return Array.from(
      new Set(delegationsForUi.map((d) => d.operatorId.toLowerCase())),
    ) as Address[];
  }, [delegationsForUi]);

  // Get unique token addresses from delegations
  const tokenAddresses = useMemo(() => {
    const addresses = new Set<EvmAddress>();
    delegationsForUi.forEach((d) => addresses.add(d.token as EvmAddress));
    return Array.from(addresses);
  }, [delegationsForUi]);

  // Fetch token metadata
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses);

  const { data: operatorRewardPools, refetch: refetchOperatorRewardPools } =
    useResilientReadContracts({
      queryKey: [
        'restake',
        'unstake',
        'operatorRewardPools',
        chainId,
        operatorAddresses,
      ] as const,
      contracts:
        contracts && operatorAddresses.length > 0
          ? operatorAddresses.map((operator) => ({
              address: contracts.multiAssetDelegation,
              abi: MULTI_ASSET_DELEGATION_ABI,
              functionName: 'getOperatorRewardPool',
              args: [operator] as const,
            }))
          : [],
      query: {
        enabled: Boolean(contracts) && operatorAddresses.length > 0,
        staleTime: 15_000,
        refetchInterval: 15_000,
        refetchIntervalInBackground: true,
      },
    });

  const operatorPoolMap = useMemo(() => {
    const map = new Map<string, { totalShares: bigint; totalAssets: bigint }>();
    if (!operatorRewardPools) return map;

    operatorRewardPools.forEach((res, idx) => {
      const operator = operatorAddresses[idx];
      if (!operator || res?.status !== 'success') return;
      const pool = res.result as {
        accRewardPerShare: bigint;
        totalShares: bigint;
        totalAssets: bigint;
        lastUpdateRound: bigint;
      };
      map.set(operator.toLowerCase(), {
        totalShares: pool.totalShares,
        totalAssets: pool.totalAssets,
      });
    });

    return map;
  }, [operatorAddresses, operatorRewardPools]);

  const [selectedDelegation, setSelectedDelegation] =
    useState<DelegationItem | null>(null);

  const selectedAssetId = watch('assetId');
  const selectedOperatorAddress = watch('operatorAddress');
  const amount = watch('amount');

  // Build delegation items with metadata
  const delegationItems = useMemo<DelegationItem[]>(() => {
    if (delegationsForUi.length === 0 || !tokenMetadatas) {
      return [];
    }

    return delegationsForUi
      .map((delegation) => {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === delegation.token.toLowerCase(),
        );

        if (!metadata) return null;

        // Calculate available to unstake (shares minus pending unstakes)
        const pendingUnstakes =
          pendingUnstakeSharesByDelegationKey.get(
            `${delegation.operatorId.toLowerCase()}-${delegation.token.toLowerCase()}`,
          ) ?? BigInt(0);

        const availableShares =
          delegation.shares > pendingUnstakes
            ? delegation.shares - pendingUnstakes
            : BigInt(0);

        // Only show delegations with available shares
        if (availableShares <= BigInt(0)) return null;

        // Convert shares to an amount that is safe to schedule at the current exchange rate.
        const pool = operatorPoolMap.get(delegation.operatorId.toLowerCase());
        const totalShares = pool?.totalShares ?? BigInt(0);
        const totalAssets = pool?.totalAssets ?? BigInt(0);
        const availableAmount =
          totalShares === BigInt(0) || totalAssets === BigInt(0)
            ? availableShares
            : (availableShares * totalAssets) / totalShares;

        if (availableAmount <= BigInt(0)) return null;

        return {
          id: delegation.id,
          operatorAddress: delegation.operatorId,
          token: delegation.token,
          tokenSymbol: metadata.symbol,
          tokenDecimals: metadata.decimals,
          shares: delegation.shares,
          lastKnownAmount: delegation.lastKnownAmount,
          availableToUnstake: availableAmount,
        };
      })
      .filter((item): item is DelegationItem => item !== null);
  }, [
    delegationsForUi,
    pendingUnstakeSharesByDelegationKey,
    operatorPoolMap,
    tokenMetadatas,
  ]);

  // Get pending unstake requests
  const unstakeRequests = useMemo(() => {
    if (delegator?.unstakeRequests && delegator.unstakeRequests.length > 0) {
      return delegator.unstakeRequests.filter((r) => r.status === 'PENDING');
    }

    if (!onChainPendingUnstakes) {
      return [];
    }

    const delay = protocolConfig?.delegationBondLessDelay ?? BigInt(0);
    return (onChainPendingUnstakes as OnChainPendingUnstake[]).map(
      (r, idx) => ({
        id: `${r.operator.toLowerCase()}-${r.asset.token.toLowerCase()}-${r.requestedRound.toString()}-${idx}`,
        operatorId: r.operator,
        token: r.asset.token,
        nonce: BigInt(0),
        shares: r.shares,
        estimatedAmount: r.shares,
        requestedRound: r.requestedRound,
        readyAtRound: r.requestedRound + delay,
        status: 'PENDING' as const,
        executedAt: null,
      }),
    ) satisfies UnstakeRequest[];
  }, [
    delegator?.unstakeRequests,
    onChainPendingUnstakes,
    protocolConfig?.delegationBondLessDelay,
  ]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!selectedDelegation) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const maxAmountBigInt = selectedDelegation.availableToUnstake;
    const formatted = Number(
      formatUnits(maxAmountBigInt, selectedDelegation.tokenDecimals),
    );

    return {
      maxAmount: maxAmountBigInt,
      formattedMaxAmount: formatted,
    };
  }, [selectedDelegation]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedDelegation?.tokenDecimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!selectedDelegation) return 'Select a delegation first';
          const parsed = parseUnits(value, selectedDelegation.tokenDecimals);
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount)
            return 'Exceeds available amount';
          return true;
        },
      }),
    };
  }, [maxAmount, register, selectedDelegation]);

  const displayError = (() => {
    return errors.operatorAddress !== undefined || !selectedOperatorAddress
      ? 'Select Delegation'
      : errors.assetId !== undefined || !selectedAssetId
        ? 'Select Asset'
        : !amount
          ? 'Enter Amount'
          : errors.amount !== undefined
            ? 'Invalid Amount'
            : undefined;
  })();

  const { execute: executeScheduleUnstake, status: unstakeTxStatus } =
    useScheduleUnstakeTx();

  const isTransacting = isSubmitting || unstakeTxStatus === TxStatus.PROCESSING;

  const isReady =
    !isTransacting &&
    selectedDelegation !== null &&
    executeScheduleUnstake !== null;

  const resetForm = useCallback(() => {
    setValue('amount', '', { shouldValidate: false });
    setValue('assetId', '' as Address, { shouldValidate: false });
    setValue('operatorAddress', '' as Address, { shouldValidate: false });
    setSelectedDelegation(null);
  }, [setValue]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      refetchDelegator(),
      refetchOnChainDelegations(),
      refetchOnChainPendingUnstakes(),
      refetchOperatorRewardPools(),
    ]);
  }, [
    refetchDelegator,
    refetchOnChainDelegations,
    refetchOnChainPendingUnstakes,
    refetchOperatorRewardPools,
  ]);

  const onSubmit = useCallback<SubmitHandler<EvmUnstakeFormFields>>(
    async ({ amount, assetId, operatorAddress }) => {
      if (!isReady || !selectedDelegation) {
        return;
      }

      const amountBigInt = parseUnits(amount, selectedDelegation.tokenDecimals);

      try {
        await executeScheduleUnstake({
          operator: operatorAddress,
          token: assetId,
          amount: amountBigInt,
        });
        await refreshAll();
        resetForm();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    },
    [
      executeScheduleUnstake,
      isReady,
      refreshAll,
      resetForm,
      selectedDelegation,
    ],
  );

  const handleDelegationSelect = useCallback(
    (item: DelegationItem) => {
      setValue('operatorAddress', item.operatorAddress);
      setValue('assetId', item.token);
      setSelectedDelegation(item);
      closeDelegationModal();
    },
    [closeDelegationModal, setValue],
  );

  return (
    <div className="grid items-start justify-center gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <div>
        <RestakeActionTabs />

        <Card withShadow tightPadding className="relative md:min-w-[512px]">
          {!isUnstakeRequestTableOpen && (
            <ExpandTableButton
              className="absolute top-0 -right-10 max-md:hidden"
              tooltipContent="Unstake requests"
              onClick={() => setIsUnstakeRequestTableOpen(true)}
            />
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start justify-stretch">
              <TransactionInputCard.Root
                tokenSymbol={selectedDelegation?.tokenSymbol}
                className="bg-mono-20 dark:bg-mono-180"
              >
                <TransactionInputCard.Header>
                  <TransactionInputCard.ChainSelector
                    placeholder="Select Delegation"
                    onClick={openDelegationModal}
                    {...(selectedDelegation
                      ? {
                          renderBody: () => (
                            <div className="flex items-center gap-2">
                              <Avatar
                                size="md"
                                theme="ethereum"
                                value={selectedDelegation.operatorAddress}
                              />
                              <div className="flex flex-col">
                                <Typography
                                  variant="h5"
                                  fw="bold"
                                  component="span"
                                  className="inline-block text-mono-200 dark:text-mono-40"
                                >
                                  {shortenHex(
                                    selectedDelegation.operatorAddress,
                                  )}
                                </Typography>
                                <Typography
                                  variant="body3"
                                  component="span"
                                  className="text-mono-120 dark:text-mono-100"
                                >
                                  {selectedDelegation.tokenSymbol}
                                </Typography>
                              </div>
                            </div>
                          ),
                        }
                      : {})}
                  />
                  <TransactionInputCard.MaxAmountButton
                    maxAmount={formattedMaxAmount}
                    tooltipBody="Available to Unstake"
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
                      isDisabled: true,
                      ...(selectedDelegation && formattedMaxAmount !== undefined
                        ? {
                            renderBody: () => (
                              <div className="flex items-center gap-2">
                                <TokenIcon
                                  name={selectedDelegation.tokenSymbol}
                                  size="lg"
                                />
                                <Typography variant="h5" fw="bold">
                                  {selectedDelegation.tokenSymbol}
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
                    {displayError ?? 'Schedule Unstake'}
                  </Button>
                );
              }}
            </ActionButtonBase>
          </form>
        </Card>
      </div>

      <AnimatedTable
        isTableOpen={isUnstakeRequestTableOpen}
        className="hidden md:block"
      >
        <UnstakeRequestsView
          unstakeRequests={unstakeRequests}
          tokenMetadatas={tokenMetadatas}
          onClose={() => setIsUnstakeRequestTableOpen(false)}
          onRefresh={refreshAll}
        />
      </AnimatedTable>

      <UnstakeRequestsView
        unstakeRequests={unstakeRequests}
        tokenMetadatas={tokenMetadatas}
        onClose={() => setIsUnstakeRequestTableOpen(false)}
        onRefresh={refreshAll}
        className="md:hidden"
      />

      <ListModal
        title="Select Delegation"
        isOpen={isDelegationModalOpen}
        setIsOpen={setIsDelegationModalOpen}
        titleWhenEmpty="No Delegations Found"
        descriptionWhenEmpty="You don't have any active delegations to unstake."
        items={delegationItems}
        searchInputId="restake-unstake-delegation-search"
        searchPlaceholder="Search delegations..."
        getItemKey={(item) => item.id}
        onSelect={handleDelegationSelect}
        filterItem={(item, query) =>
          filterBy(query, [item.operatorAddress, item.tokenSymbol])
        }
        renderItem={(item) => {
          const fmtBalance = formatDisplayAmount(
            new BN(item.availableToUnstake.toString()),
            item.tokenDecimals,
            AmountFormatStyle.SHORT,
          );
          return (
            <LogoListItem
              logo={<TokenIcon size="xl" name={item.tokenSymbol} />}
              leftUpperContent={`${item.tokenSymbol} Delegation`}
              leftBottomContent={
                <Typography
                  variant="body1"
                  className="text-mono-120 dark:text-mono-100"
                >
                  Operator: {shortenHex(item.operatorAddress)}
                </Typography>
              }
              rightUpperText={`${fmtBalance} ${item.tokenSymbol}`}
              rightBottomText="Available"
            />
          );
        }}
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
    </div>
  );
};

export default RestakeUnstakeForm;

// Unstake requests view component
type UnstakeRequestsViewProps = {
  unstakeRequests: UnstakeRequest[];
  tokenMetadatas:
    | Array<{ id: EvmAddress; symbol: string; decimals: number }>
    | undefined;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  className?: string;
};

const UnstakeRequestsView: FC<UnstakeRequestsViewProps> = ({
  unstakeRequests,
  tokenMetadatas,
  onClose,
  onRefresh,
  className,
}) => {
  const { data: config } = useProtocolConfig();
  const currentRound = config?.currentRound ?? BigInt(0);
  const readyCount = unstakeRequests.filter(
    (r) => r.readyAtRound <= currentRound,
  ).length;

  const { execute: executeUnstake, status: executeStatus } =
    useExecuteUnstakeTx();
  const isExecuting = executeStatus === TxStatus.PROCESSING;

  return (
    <RestakeDetailCard.Root className={twMerge('!min-w-0', className)}>
      <div className="flex items-center justify-between">
        <RestakeDetailCard.Header
          title={
            unstakeRequests.length > 0
              ? 'Unstake Requests'
              : 'No Unstake Requests'
          }
        />

        <div className="flex items-center gap-2">
          {unstakeRequests.length > 0 && (
            <Button
              size="sm"
              isDisabled={
                readyCount === 0 || executeUnstake === null || isExecuting
              }
              isLoading={isExecuting}
              onClick={async () => {
                if (!executeUnstake) return;
                await executeUnstake(undefined as void);
                await onRefresh();
              }}
            >
              Execute Ready ({readyCount})
            </Button>
          )}

          <IconButton onClick={onClose}>
            <Cross1Icon />
          </IconButton>
        </div>
      </div>

      {unstakeRequests.length > 0 ? (
        <div className="space-y-2">
          {unstakeRequests.map((request) => {
            const metadata = tokenMetadatas?.find(
              (m) => m.id.toLowerCase() === request.token.toLowerCase(),
            );
            const isReady = request.readyAtRound <= currentRound;

            return (
              <div
                key={request.id}
                className="p-3 border rounded-lg border-mono-60 dark:border-mono-140"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Typography
                      variant="body3"
                      className="font-mono text-mono-120 dark:text-mono-100"
                    >
                      {shortenHex(request.operatorId)}
                    </Typography>
                    <span className="text-sm font-medium">
                      {metadata
                        ? formatUnits(
                            request.estimatedAmount,
                            metadata.decimals,
                          )
                        : request.estimatedAmount.toString()}{' '}
                      {metadata?.symbol ?? 'tokens'}
                    </span>
                  </div>
                  <div className="text-xs text-mono-100 text-right">
                    <div>{isReady ? 'Ready' : 'Pending'}</div>
                    <div>Round {request.readyAtRound.toString()}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Typography
          variant="body1"
          className="text-mono-120 dark:text-mono-100"
        >
          Your requests will appear here after scheduling an unstake. Requests
          can be executed after the waiting period.
        </Typography>
      )}
    </RestakeDetailCard.Root>
  );
};
