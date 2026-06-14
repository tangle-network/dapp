import { Cross1Icon } from '@radix-ui/react-icons';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { ChainIcon } from '@tangle-network/icons/ChainIcon';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import { Card, IconButton } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { Address, formatUnits, parseUnits, zeroAddress } from 'viem';
import { useAccount, useBlockNumber, useChainId } from 'wagmi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import StakingDetailCard from '../../../components/StakingDetailCard';
import ActionButtonBase from '../../../components/staking/ActionButtonBase';
import StyleContainer from '../../../components/staking/StyleContainer';
import { SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/staking';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { EvmWithdrawFormFields } from '../../../types/staking';
import decimalsToStep from '../../../utils/decimalsToStep';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import StakingActionTabs from '../StakingActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import { twMerge } from 'tailwind-merge';

// EVM hooks
import {
  useDelegator,
  useProtocolConfig,
  useStakingAssets,
  type StakingAsset,
  type WithdrawRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useExecuteWithdrawTx,
  useScheduleWithdrawTx,
} from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import AssetListItem from '../../../components/Lists/AssetListItem';
import MULTI_ASSET_DELEGATION_ABI from '@tangle-network/tangle-shared-ui/abi/multiAssetDelegation';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import { useResilientReadContract } from '@tangle-network/tangle-shared-ui/hooks/useResilientReadContract';
import { useResilientReadContracts } from '@tangle-network/tangle-shared-ui/hooks/useResilientReadContracts';

// Asset position item for selection
type AssetPositionItem = {
  id: string;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  totalDeposited: bigint;
  delegatedAmount: bigint;
  availableToWithdraw: bigint; // min(available, free) at current lock state
};

const NATIVE_TOKEN_ADDRESS = zeroAddress as Address;
const NATIVE_ASSET_METADATA = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const safeParseUnits = (value: string, decimals: number): bigint | null => {
  try {
    return parseUnits(value, decimals);
  } catch {
    return null;
  }
};

const StakingWithdrawForm: FC = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<EvmWithdrawFormFields>({
    mode: 'onChange',
  });

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();

  const {
    status: isAssetModalOpen,
    open: openAssetModal,
    close: closeAssetModal,
    update: updateAssetModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  const [isWithdrawRequestTableOpen, setIsWithdrawRequestTableOpen] =
    useState(false);

  // Register form fields on mount
  useEffect(() => {
    register('assetId', { required: true });
  }, [register]);

  // Reset form when active chain changes
  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  // Fetch delegator data
  const { data: delegator, refetch: refetchDelegator } =
    useDelegator(userAddress);
  const { assets: stakingAssets } = useStakingAssets({
    enabled: Boolean(userAddress),
  });

  // Get token addresses from enabled staking assets (on-chain contracts need this even if indexer lags)
  const tokenAddresses = useMemo(() => {
    const addresses = stakingAssets
      ? (Array.from(stakingAssets.keys()) as Address[])
      : [];
    const hasNativeToken = addresses.some(
      (token) => token.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
    );

    return (
      hasNativeToken ? addresses : [...addresses, NATIVE_TOKEN_ADDRESS]
    ) as EvmAddress[];
  }, [stakingAssets]);

  const tokenMetadatas = useMemo(() => {
    const stakingAssetList = Array.from(
      stakingAssets?.values() ?? [],
    ) as StakingAsset[];

    const metadatas = stakingAssetList.map((asset) => ({
      id: asset.id as unknown as EvmAddress,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      decimals: asset.metadata.decimals,
    }));

    const hasNativeMetadata = metadatas.some(
      (asset) => asset.id.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase(),
    );

    if (!hasNativeMetadata) {
      metadatas.push({
        id: NATIVE_TOKEN_ADDRESS as EvmAddress,
        ...NATIVE_ASSET_METADATA,
      });
    }

    return metadatas;
  }, [stakingAssets]);

  const contracts = useMemo(() => {
    try {
      return getContractsByChainId(chainId);
    } catch {
      return null;
    }
  }, [chainId]);

  // Fetch deposit amounts from getDeposit
  const { data: depositResults, refetch: refetchDeposits } =
    useResilientReadContracts({
      queryKey: [
        'staking',
        'withdraw',
        'deposits',
        chainId,
        userAddress,
        tokenAddresses.map((t) => t.toLowerCase()).sort(),
      ],
      chainId,
      contracts:
        contracts && userAddress && tokenAddresses.length > 0
          ? tokenAddresses.map((token) => ({
              address: contracts.multiAssetDelegation,
              abi: MULTI_ASSET_DELEGATION_ABI,
              functionName: 'getDeposit',
              args: [userAddress, token] as const,
            }))
          : [],
      query: {
        enabled:
          Boolean(contracts) &&
          Boolean(userAddress) &&
          tokenAddresses.length > 0,
        staleTime: 2_000,
        refetchInterval: 2_000,
        refetchIntervalInBackground: true,
        retry: 2,
      },
    });

  const depositAmountMap = useMemo(() => {
    const map = new Map<string, { amount: bigint; delegatedAmount: bigint }>();
    if (!depositResults) return map;

    depositResults.forEach((res, idx) => {
      const token = tokenAddresses[idx];
      if (!token || res?.status !== 'success') return;
      const deposit = res.result as
        | { amount: bigint; delegatedAmount: bigint }
        | readonly [bigint, bigint];
      const amount = Array.isArray(deposit)
        ? deposit[0]
        : (deposit as { amount: bigint }).amount;
      const delegatedAmount = Array.isArray(deposit)
        ? deposit[1]
        : (deposit as { delegatedAmount: bigint }).delegatedAmount;
      map.set(token.toLowerCase(), { amount, delegatedAmount });
    });

    return map;
  }, [depositResults, tokenAddresses]);

  // Combine deposit and delegation data
  const depositMap = useMemo(() => {
    const map = new Map<string, { amount: bigint; delegatedAmount: bigint }>();

    for (const [token, deposit] of depositAmountMap.entries()) {
      map.set(token, deposit);
    }

    return map;
  }, [depositAmountMap]);

  const { data: currentBlockNumber } = useBlockNumber({ watch: true });

  const { data: lockResults, refetch: refetchLocks } =
    useResilientReadContracts({
      queryKey: [
        'staking',
        'withdraw',
        'locks',
        chainId,
        userAddress,
        tokenAddresses,
      ] as const,
      contracts:
        contracts && userAddress && tokenAddresses.length > 0
          ? tokenAddresses.map((token) => ({
              address: contracts.multiAssetDelegation,
              abi: MULTI_ASSET_DELEGATION_ABI,
              functionName: 'getLocks',
              args: [userAddress, token] as const,
            }))
          : [],
      query: {
        enabled:
          Boolean(contracts) &&
          Boolean(userAddress) &&
          tokenAddresses.length > 0,
        staleTime: 2_000,
        refetchInterval: 2_000,
        refetchIntervalInBackground: true,
      },
    });

  const lockedMap = useMemo(() => {
    const map = new Map<string, bigint>();
    if (!lockResults || currentBlockNumber === undefined) return map;

    lockResults.forEach((res, idx) => {
      const token = tokenAddresses[idx];
      if (!token || res?.status !== 'success') return;
      const locks = res.result as Array<{
        amount: bigint;
        multiplier: number;
        expiryBlock: bigint;
      }>;

      const locked = locks.reduce((sum, lock) => {
        return lock.expiryBlock > currentBlockNumber ? sum + lock.amount : sum;
      }, BigInt(0));

      map.set(token.toLowerCase(), locked);
    });

    return map;
  }, [currentBlockNumber, lockResults, tokenAddresses]);

  const selectedAssetId = watch('assetId');
  const amount = watch('amount');

  const { data: protocolConfig } = useProtocolConfig();

  const {
    data: onChainPendingWithdrawals,
    refetch: refetchOnChainWithdrawals,
  } = useResilientReadContract({
    queryKey: [
      'staking',
      'withdraw',
      'pendingWithdrawals',
      chainId,
      userAddress,
    ] as const,
    contract:
      contracts && userAddress
        ? {
            address: contracts.multiAssetDelegation,
            abi: MULTI_ASSET_DELEGATION_ABI,
            functionName: 'getPendingWithdrawals',
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

  // Get pending withdraw requests (prefer on-chain data as source of truth, fall back to indexer)
  const withdrawRequests = useMemo(() => {
    // On-chain data is the source of truth - use it when available
    if (
      Array.isArray(onChainPendingWithdrawals) &&
      onChainPendingWithdrawals.length > 0
    ) {
      const delayRounds =
        protocolConfig?.isSupported === true
          ? protocolConfig.leaveDelegatorsDelay
          : BigInt(0);
      return (
        onChainPendingWithdrawals as Array<{
          asset: { kind: number; token: Address };
          amount: bigint;
          requestedRound: bigint;
        }>
      ).map((r, idx) => ({
        id: `${r.asset.token.toLowerCase()}-${r.requestedRound.toString()}-${idx}`,
        token: r.asset.token,
        nonce: BigInt(0),
        amount: r.amount,
        requestedRound: r.requestedRound,
        readyAtRound: r.requestedRound + delayRounds,
        status: 'PENDING' as const,
        executedAt: null,
      })) satisfies WithdrawRequest[];
    }

    // If on-chain returns empty array, it means no pending requests (source of truth)
    if (Array.isArray(onChainPendingWithdrawals)) {
      return [];
    }

    // Fall back to indexer only when on-chain data is not yet available
    return (
      delegator?.withdrawRequests.filter((r) => r.status === 'PENDING') ?? []
    );
  }, [delegator?.withdrawRequests, onChainPendingWithdrawals, protocolConfig]);

  // Build asset position items with metadata
  const assetPositionItems = useMemo<AssetPositionItem[]>(() => {
    if (!tokenMetadatas || !depositMap) {
      return [];
    }

    return tokenAddresses.flatMap((token) => {
      const metadata = tokenMetadatas.find(
        (m) => m.id.toLowerCase() === token.toLowerCase(),
      );

      if (!metadata) return [];

      const deposit = depositMap.get(token.toLowerCase());
      const totalDeposited = deposit?.amount ?? BigInt(0);
      const delegatedAmount = deposit?.delegatedAmount ?? BigInt(0);
      const lockedAmount = lockedMap.get(token.toLowerCase()) ?? BigInt(0);

      const available =
        totalDeposited > delegatedAmount
          ? totalDeposited - delegatedAmount
          : BigInt(0);
      const free =
        totalDeposited > lockedAmount
          ? totalDeposited - lockedAmount
          : BigInt(0);
      const availableToWithdraw = available < free ? available : free;

      // Only show positions with available balance
      if (availableToWithdraw <= BigInt(0)) return [];

      return [
        {
          id: token.toLowerCase(),
          token,
          tokenSymbol: metadata.symbol,
          tokenDecimals: metadata.decimals,
          totalDeposited,
          delegatedAmount,
          availableToWithdraw,
        } satisfies AssetPositionItem,
      ];
    });
  }, [depositMap, lockedMap, tokenAddresses, tokenMetadatas]);

  const selectedAssetPosition = useMemo(() => {
    if (!selectedAssetId) {
      return null;
    }

    const selectedToken = selectedAssetId.toLowerCase();
    return (
      assetPositionItems.find(
        (item) => item.token.toLowerCase() === selectedToken,
      ) ?? null
    );
  }, [assetPositionItems, selectedAssetId]);

  const { maxAmount, maxAmountInputValue } = useMemo(() => {
    if (!selectedAssetPosition) {
      return { maxAmount: undefined, maxAmountInputValue: undefined };
    }

    return {
      maxAmount: selectedAssetPosition.availableToWithdraw,
      maxAmountInputValue: formatUnits(
        selectedAssetPosition.availableToWithdraw,
        selectedAssetPosition.tokenDecimals,
      ),
    };
  }, [selectedAssetPosition]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAssetPosition?.tokenDecimals);

    return {
      type: 'number',
      step,
      'data-testid': 'staking-withdraw-amount-input',
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!selectedAssetPosition) return 'Select an asset first';
          const parsed = safeParseUnits(
            value,
            selectedAssetPosition.tokenDecimals,
          );
          if (parsed === null) return 'Enter a valid amount';
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount)
            return 'Exceeds available amount';
          return true;
        },
      }),
    };
  }, [maxAmount, register, selectedAssetPosition]);

  const displayError = useMemo(() => {
    return errors.assetId !== undefined || !selectedAssetId
      ? 'Select Asset'
      : !amount
        ? 'Enter an amount'
        : errors.amount !== undefined
          ? 'Invalid amount'
          : undefined;
  }, [errors.assetId, errors.amount, selectedAssetId, amount]);

  const { execute: executeScheduleWithdraw, status: withdrawTxStatus } =
    useScheduleWithdrawTx();

  const isTransacting =
    isSubmitting || withdrawTxStatus === TxStatus.PROCESSING;

  const isReady =
    !isTransacting &&
    selectedAssetPosition !== null &&
    executeScheduleWithdraw !== null;

  const onSubmit = useCallback<SubmitHandler<EvmWithdrawFormFields>>(
    async ({ amount, assetId }) => {
      if (!isReady || !selectedAssetPosition) {
        return;
      }

      const amountBigInt = safeParseUnits(
        amount,
        selectedAssetPosition.tokenDecimals,
      );
      if (amountBigInt === null) {
        return;
      }

      await executeScheduleWithdraw({
        token: assetId,
        amount: amountBigInt,
      });

      await Promise.allSettled([
        refetchDelegator(),
        refetchDeposits(),
        refetchLocks(),
        refetchOnChainWithdrawals(),
      ]);
      setFormValue('amount', '', { shouldValidate: false });
      setFormValue('assetId', '' as Address, { shouldValidate: false });
    },
    [
      executeScheduleWithdraw,
      isReady,
      refetchDelegator,
      refetchDeposits,
      refetchLocks,
      refetchOnChainWithdrawals,
      selectedAssetPosition,
      setFormValue,
    ],
  );

  const handleAssetSelect = useCallback(
    (item: AssetPositionItem) => {
      setFormValue('assetId', item.token, {
        shouldDirty: true,
        shouldValidate: true,
      });
      closeAssetModal();
    },
    [closeAssetModal, setFormValue],
  );

  return (
    <div className="grid items-start justify-center gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <StyleContainer>
        <StakingActionTabs />

        <Card withShadow tightPadding className="relative md:min-w-[512px]">
          {!isWithdrawRequestTableOpen && (
            <ExpandTableButton
              data-testid="staking-withdraw-requests-toggle"
              className="absolute top-0 -right-10 max-md:hidden"
              tooltipContent="Withdrawal requests"
              requestCount={withdrawRequests.length}
              onClick={() => setIsWithdrawRequestTableOpen(true)}
            />
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col items-start justify-stretch">
              <TransactionInputCard.Root
                tokenSymbol={selectedAssetPosition?.tokenSymbol}
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
                    maxAmount={maxAmountInputValue}
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
                  customAmountProps={customAmountProps}
                  tokenSelectorProps={
                    {
                      placeholder: <AssetPlaceholder />,
                      onClick: openAssetModal,
                      'data-testid': 'staking-withdraw-asset-selector',
                      ...(selectedAssetPosition
                        ? {
                            renderBody: () => (
                              <div className="flex items-center gap-2">
                                <TokenIcon
                                  name={selectedAssetPosition.tokenSymbol}
                                  size="lg"
                                />
                                <Typography variant="h5" fw="bold">
                                  {selectedAssetPosition.tokenSymbol}
                                </Typography>
                              </div>
                            ),
                          }
                        : {}),
                    } as any
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
                  SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS.includes(
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
                    data-testid="staking-withdraw-submit"
                    isDisabled={!isValid || isDefined(displayError) || !isReady}
                    type="submit"
                    isFullWidth
                    isLoading={isTransacting || isLoading}
                    loadingText={loadingText}
                  >
                    {displayError ?? 'Schedule Withdraw'}
                  </Button>
                );
              }}
            </ActionButtonBase>
          </form>
        </Card>
      </StyleContainer>

      <AnimatedTable
        className="hidden md:block"
        isTableOpen={isWithdrawRequestTableOpen}
      >
        <WithdrawRequestView
          withdrawRequests={withdrawRequests}
          tokenMetadatas={tokenMetadatas}
          onClose={() => setIsWithdrawRequestTableOpen(false)}
          onRefresh={async () => {
            await Promise.allSettled([
              refetchDelegator(),
              refetchDeposits(),
              refetchLocks(),
              refetchOnChainWithdrawals(),
            ]);
          }}
        />
      </AnimatedTable>

      <WithdrawRequestView
        withdrawRequests={withdrawRequests}
        tokenMetadatas={tokenMetadatas}
        onClose={() => setIsWithdrawRequestTableOpen(false)}
        onRefresh={async () => {
          await Promise.allSettled([
            refetchDelegator(),
            refetchDeposits(),
            refetchLocks(),
            refetchOnChainWithdrawals(),
          ]);
        }}
        className="md:hidden"
      />

      <ListModal
        title="Select Asset"
        isOpen={isAssetModalOpen}
        setIsOpen={updateAssetModal}
        titleWhenEmpty="No Assets Available"
        descriptionWhenEmpty="You don't have any deposited assets available to withdraw."
        items={assetPositionItems}
        searchInputId="staking-withdraw-asset-search"
        searchPlaceholder="Search assets..."
        getItemKey={(item) => item.id}
        onSelect={handleAssetSelect}
        filterItem={(item, query) =>
          filterBy(query, [item.token, item.tokenSymbol])
        }
        renderItem={(item) => (
          <AssetListItem
            assetId={item.token}
            symbol={item.tokenSymbol}
            balance={item.availableToWithdraw}
            decimals={item.tokenDecimals}
            rightBottomText="Available"
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
    </div>
  );
};

export default StakingWithdrawForm;

// Withdraw requests view component
type WithdrawRequestViewProps = {
  withdrawRequests: WithdrawRequest[];
  tokenMetadatas:
    | Array<{ id: EvmAddress; symbol: string; decimals: number }>
    | undefined;
  onClose: () => void;
  onRefresh: () => Promise<unknown>;
  className?: string;
};

const WithdrawRequestView: FC<WithdrawRequestViewProps> = ({
  withdrawRequests,
  tokenMetadatas,
  onClose,
  onRefresh,
  className,
}) => {
  const { data: config } = useProtocolConfig();
  const currentRound =
    config?.isSupported === true ? config.currentRound : BigInt(0);
  const readyCount = withdrawRequests.filter(
    (r) => r.readyAtRound <= currentRound,
  ).length;

  const { execute: executeWithdraw, status: executeStatus } =
    useExecuteWithdrawTx();
  const isExecuting = executeStatus === TxStatus.PROCESSING;

  return (
    <StakingDetailCard.Root className={twMerge('!min-w-0', className)}>
      <div className="flex items-center justify-between gap-2">
        <StakingDetailCard.Header
          title={
            withdrawRequests.length > 0
              ? 'Withdrawal Requests'
              : 'No Withdrawal Requests'
          }
        />

        <div className="flex items-center gap-2">
          {withdrawRequests.length > 0 && (
            <Button
              data-testid="staking-withdraw-execute-ready"
              size="sm"
              isDisabled={
                readyCount === 0 || executeWithdraw === null || isExecuting
              }
              isLoading={isExecuting}
              onClick={async () => {
                if (!executeWithdraw) return;
                await executeWithdraw(undefined as void);
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

      {withdrawRequests.length > 0 ? (
        <div className="space-y-2">
          {withdrawRequests.map((request) => {
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
                    <span className="text-sm font-medium">
                      {metadata
                        ? formatUnits(request.amount, metadata.decimals)
                        : request.amount.toString()}{' '}
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
          Your requests will appear here after scheduling a withdrawal. Requests
          can be executed after the waiting period.
        </Typography>
      )}
    </StakingDetailCard.Root>
  );
};
