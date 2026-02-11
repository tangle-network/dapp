import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card, getRoundedAmountString } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useFormSetValue from '../../../hooks/useFormSetValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { parseUnits, formatUnits, Address, isAddress } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import decimalsToStep from '../../../utils/decimalsToStep';
import SupportedChainModal from '../../restake/SupportedChainModal';
import useSwitchChain from '../../restake/useSwitchChain';
import LiquidStakingActionTabs from '../LiquidStakingActionTabs';
import {
  useLiquidDelegationVaults,
  useVaultRequestRedeem,
  useVaultUserPosition,
  type LiquidDelegationVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import {
  useLiquidRedeemRequests,
  useRestakeAssets,
  type LiquidRedeemRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import LIQUID_DELEGATION_VAULT_ABI from '@tangle-network/tangle-shared-ui/abi/liquidDelegationVault';
import { useVaultRedeem } from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import VaultListItem from '../../../components/Lists/VaultListItem';

type RedeemFormFields = {
  vaultAddress: Address;
  amount: string;
};

// ERC-4626/ERC-7540 vault shares always use 18 decimals regardless of the underlying asset
const VAULT_SHARES_DECIMALS = 18;

const LiquidStakingRedeemForm: FC = () => {
  const [searchParams] = useSearchParams();
  const { address: userAddress } = useAccount();
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { vaults, isLoading: isLoadingVaults } = useLiquidDelegationVaults();
  const { assets } = useRestakeAssets();
  const { status: redeemStatus, execute: executeRedeem } =
    useVaultRequestRedeem();
  const { status: claimStatus, execute: executeClaim } = useVaultRedeem();

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RedeemFormFields>({
    mode: 'onChange',
  });

  const setValue = useFormSetValue(setFormValue);

  useEffect(() => {
    register('vaultAddress', { required: 'Vault is required' });
  }, [register]);

  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  // Pre-select vault from URL query parameter
  useEffect(() => {
    const vaultParam = searchParams.get('vault');

    if (!vaultParam || !vaults || !isAddress(vaultParam)) {
      return;
    }

    const matchingVault = vaults.find(
      (v) => v.address.toLowerCase() === vaultParam.toLowerCase(),
    );

    if (matchingVault) {
      setValue('vaultAddress', matchingVault.address);
    }
  }, [searchParams, vaults, setValue]);

  const {
    status: vaultModalOpen,
    close: closeVaultModal,
    open: openVaultModal,
    update: updateVaultModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  const vaultAddress = watch('vaultAddress');
  const amount = watch('amount');

  const selectedVault = useMemo(() => {
    if (!vaults || !vaultAddress) {
      return null;
    }
    return vaults.find((v) => v.address === vaultAddress) ?? null;
  }, [vaults, vaultAddress]);

  const { position, refetch: refetchPosition } = useVaultUserPosition(
    selectedVault?.address,
  );

  const { data: indexerRedeemRequests = [], refetch: refetchRedeemRequests } =
    useLiquidRedeemRequests(userAddress, selectedVault?.address);

  // Optimistic redeem requests that are shown immediately while waiting for the indexer
  const [optimisticRequests, setOptimisticRequests] = useState<
    LiquidRedeemRequest[]
  >([]);

  // Ref to store timeout ID for cleanup
  const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up optimistic requests when they appear in the indexer data
  // Match by shares, controller, vault address, AND timestamp (within 60s tolerance)
  // This prevents race conditions when multiple requests have the same share amount
  useEffect(() => {
    const TIMESTAMP_TOLERANCE_SECONDS = BigInt(60);

    setOptimisticRequests((prev) =>
      prev.filter(
        (opt) =>
          !indexerRedeemRequests.some((req) => {
            const sameVault =
              req.vaultAddress.toLowerCase() === opt.vaultAddress.toLowerCase();
            const sameShares = req.shares === opt.shares;
            const sameController =
              req.controller.toLowerCase() === opt.controller.toLowerCase();

            // Check if timestamps are within tolerance window
            const timeDiff =
              req.createdAt > opt.createdAt
                ? req.createdAt - opt.createdAt
                : opt.createdAt - req.createdAt;
            const withinTimeWindow = timeDiff <= TIMESTAMP_TOLERANCE_SECONDS;

            return (
              sameVault && sameShares && sameController && withinTimeWindow
            );
          }),
      ),
    );
  }, [indexerRedeemRequests]);

  // Merge optimistic requests with indexer data
  const redeemRequests = useMemo(() => {
    if (optimisticRequests.length === 0) {
      return indexerRedeemRequests;
    }

    // Prepend remaining optimistic requests to the list
    return [...optimisticRequests, ...indexerRedeemRequests];
  }, [optimisticRequests, indexerRedeemRequests]);

  // Clear optimistic requests when vault changes
  useEffect(() => {
    setOptimisticRequests([]);
  }, [selectedVault?.address]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refetchTimeoutRef.current !== null) {
        clearTimeout(refetchTimeoutRef.current);
      }
    };
  }, []);

  // Only check claimable status for indexed requests (not optimistic ones)
  // Optimistic requests have fake IDs starting with "optimistic-" and requestId of 0
  const indexedRequestsForClaimable = useMemo(() => {
    return indexerRedeemRequests.filter((req) => req.requestId !== BigInt(0));
  }, [indexerRedeemRequests]);

  const claimableContracts = useMemo(() => {
    if (!selectedVault || indexedRequestsForClaimable.length === 0) return [];
    return indexedRequestsForClaimable.map((req) => ({
      address: selectedVault.address,
      abi: LIQUID_DELEGATION_VAULT_ABI,
      functionName: 'claimableRedeemRequest' as const,
      args: [req.requestId, req.controller] as const,
    }));
  }, [indexedRequestsForClaimable, selectedVault]);

  const { data: claimableResults } = useReadContracts({
    contracts: claimableContracts,
    query: {
      enabled: claimableContracts.length > 0,
      staleTime: 15_000,
      refetchInterval: 15_000,
      refetchIntervalInBackground: true,
    },
  });

  const claimableByRequestId = useMemo(() => {
    const map = new Map<string, bigint>();
    if (!claimableResults) return map;
    claimableResults.forEach((res, idx) => {
      const req = indexedRequestsForClaimable[idx];
      if (!req || res?.status !== 'success') return;
      map.set(req.id, res.result as bigint);
    });
    return map;
  }, [claimableResults, indexedRequestsForClaimable]);

  const vaultAsset = useMemo(() => {
    if (!selectedVault || !assets) {
      return null;
    }
    // Normalize to lowercase since indexer stores addresses in lowercase
    // but blockchain reads return checksummed (mixed-case) addresses
    const normalizedAsset = selectedVault.asset.toLowerCase() as Address;
    return assets.get(normalizedAsset) ?? null;
  }, [selectedVault, assets]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!position) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    // position.balance already reflects the user's current share balance
    // after any pending redeem requests (shares are burned immediately
    // when requestRedeem is called in ERC-7540 vaults)
    const formatted = Number(
      formatUnits(position.balance, VAULT_SHARES_DECIMALS),
    );

    return {
      maxAmount: position.balance,
      formattedMaxAmount: formatted,
    };
  }, [position]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(VAULT_SHARES_DECIMALS);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!position) return 'Select a vault first';
          const parsed = parseUnits(value, VAULT_SHARES_DECIMALS);
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Insufficient balance';
          return true;
        },
      }),
    };
  }, [position, maxAmount, register]);

  const displayError = useMemo(() => {
    return errors.vaultAddress !== undefined || !vaultAddress
      ? 'Select Vault'
      : !amount
        ? 'Enter an amount'
        : errors.amount !== undefined
          ? 'Invalid amount'
          : undefined;
  }, [errors.vaultAddress, errors.amount, vaultAddress, amount]);

  const handleVaultSelection = useCallback(
    (vault: LiquidDelegationVault) => {
      setValue('vaultAddress', vault.address);
      closeVaultModal();
    },
    [closeVaultModal, setValue],
  );

  const isTransacting = isSubmitting || redeemStatus === TxStatus.PROCESSING;
  const isClaiming = claimStatus === TxStatus.PROCESSING;

  const isReady =
    executeRedeem !== null &&
    selectedVault !== null &&
    userAddress !== undefined &&
    position !== null &&
    !isTransacting;

  const onSubmit = useCallback<SubmitHandler<RedeemFormFields>>(
    async ({ vaultAddress: vault, amount }) => {
      if (!isReady || !userAddress || !selectedVault) {
        return;
      }

      // Parse the input as shares
      const sharesBigInt = parseUnits(amount, VAULT_SHARES_DECIMALS);

      if (sharesBigInt <= BigInt(0)) {
        return;
      }

      await executeRedeem({
        vaultAddress: vault,
        asset: selectedVault.asset,
        shares: sharesBigInt,
        controller: userAddress,
        owner: userAddress,
      });

      // Add optimistic redeem request immediately so UI updates without waiting for indexer
      const optimisticRequest: LiquidRedeemRequest = {
        id: `optimistic-${Date.now()}`,
        vaultId: selectedVault.address.toLowerCase(),
        vaultAddress: selectedVault.address,
        controller: userAddress,
        owner: userAddress,
        requestId: BigInt(0), // Unknown until indexed
        shares: sharesBigInt,
        estimatedAssets: BigInt(0), // Will be calculated when indexed
        requestedRound: BigInt(0),
        claimed: false,
        createdAt: BigInt(Math.floor(Date.now() / 1000)),
        claimedAt: null,
        txHash: '0x', // Unknown until indexed
      };
      setOptimisticRequests((prev) => [optimisticRequest, ...prev]);

      setValue('amount', '', { shouldValidate: false });

      // Refetch user position to update the "Your Shares" display immediately
      await refetchPosition();

      // Refetch redeem requests after a short delay to allow the indexer to process
      // the new transaction. The optimistic entry will be replaced once indexed.
      if (refetchTimeoutRef.current !== null) {
        clearTimeout(refetchTimeoutRef.current);
      }
      refetchTimeoutRef.current = setTimeout(() => {
        refetchRedeemRequests();
        refetchTimeoutRef.current = null;
      }, 3000);
    },
    [
      isReady,
      userAddress,
      selectedVault,
      executeRedeem,
      setValue,
      refetchPosition,
      refetchRedeemRequests,
    ],
  );

  return (
    <StyleContainer>
      <LiquidStakingActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root className="bg-mono-20 dark:bg-mono-180">
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Vault"
                  onClick={openVaultModal}
                  {...(selectedVault
                    ? {
                        renderBody: () => (
                          <div className="flex items-center gap-2">
                            <TokenIcon
                              size="lg"
                              name={
                                vaultAsset?.metadata.symbol ??
                                selectedVault.symbol
                              }
                            />
                            <div className="flex flex-col">
                              <Typography variant="h5" fw="bold">
                                {vaultAsset?.metadata.symbol ??
                                  selectedVault.symbol}{' '}
                                Vault
                              </Typography>
                              <Typography
                                variant="body3"
                                className="text-mono-120 dark:text-mono-100"
                              >
                                {selectedVault.selectionMode === 0
                                  ? 'All blueprints'
                                  : `${selectedVault.blueprintIds.length} blueprints`}
                              </Typography>
                            </div>
                          </div>
                        ),
                      }
                    : {})}
                />
                <TransactionInputCard.MaxAmountButton
                  maxAmount={formattedMaxAmount}
                  tokenSymbol="shares"
                  tooltipBody="Available Shares"
                  Icon={useMemo(
                    () => ({
                      enabled: <LockUnlockLineIcon />,
                      disabled: <LockUnlockLineIcon />,
                    }),
                    [],
                  )}
                  onAmountChange={(value) => {
                    setValue('amount', value, { shouldValidate: true });
                  }}
                />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                customAmountProps={customAmountProps}
                tokenSelectorProps={{
                  children: (
                    <Typography variant="h5" fw="bold" component="span">
                      Shares
                    </Typography>
                  ),
                  isDisabled: true,
                  isDropdown: false,
                }}
              />
            </TransactionInputCard.Root>

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </div>

          {selectedVault && position && (
            <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-160 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-mono-100">Your Shares</span>
                <span className="font-medium">
                  {formatUnits(position.balance, VAULT_SHARES_DECIMALS)}
                </span>
              </div>
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-50/10 border border-yellow-50/20">
            <Typography variant="body2" className="text-yellow-50">
              Redemption is asynchronous. After requesting, there is a waiting
              period before you can claim your assets.
            </Typography>
          </div>

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
                  {displayError ?? 'Request Redeem'}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </Card>

      {selectedVault && (
        <Card withShadow tightPadding className="md:min-w-[512px] mt-4">
          <div className="flex items-center justify-between">
            <Typography variant="h5" fw="bold">
              Pending Redeem Requests
            </Typography>
          </div>

          {redeemRequests.length === 0 ? (
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100 mt-2"
            >
              No pending requests for this vault.
            </Typography>
          ) : (
            <div className="mt-3 space-y-2">
              {redeemRequests.map((req) => {
                const claimableShares =
                  claimableByRequestId.get(req.id) ?? BigInt(0);
                const isReadyToClaim = claimableShares > BigInt(0);

                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-mono-60 dark:border-mono-140"
                  >
                    <div className="flex flex-col">
                      <Typography variant="body2" fw="semibold">
                        {getRoundedAmountString(
                          Number(
                            formatUnits(req.shares, VAULT_SHARES_DECIMALS),
                          ),
                          5,
                        )}{' '}
                        shares
                      </Typography>
                      <Typography
                        variant="body3"
                        className="text-mono-120 dark:text-mono-100"
                      >
                        {isReadyToClaim
                          ? 'Ready to claim'
                          : 'Waiting for undelegate delay'}
                      </Typography>
                    </div>

                    <Button
                      size="sm"
                      isDisabled={
                        !isReadyToClaim || !executeClaim || isClaiming
                      }
                      isLoading={isClaiming}
                      onClick={async () => {
                        if (!executeClaim || !userAddress) return;
                        await executeClaim({
                          vaultAddress: selectedVault.address,
                          asset: selectedVault.asset,
                          shares: claimableShares,
                          receiver: userAddress,
                          controller: req.controller,
                        });
                        // Refetch both redeem requests and user position to update UI immediately
                        await Promise.all([
                          refetchRedeemRequests(),
                          refetchPosition(),
                        ]);
                      }}
                    >
                      Redeem
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      <ListModal
        title="Select Vault"
        isOpen={vaultModalOpen}
        setIsOpen={updateVaultModal}
        onSelect={handleVaultSelection}
        filterItem={(vault, query) =>
          filterBy(query, [vault.address, vault.operator, vault.name])
        }
        searchInputId="liquid-staking-vault-redeem-search"
        searchPlaceholder="Search vaults..."
        titleWhenEmpty="No Vaults Found"
        descriptionWhenEmpty="No liquid delegation vaults found with positions."
        items={vaults}
        isLoading={isLoadingVaults}
        getItemKey={(vault) => vault.address}
        renderItem={(vault) => {
          const asset = assets?.get(vault.asset.toLowerCase() as Address);
          const tvl = formatUnits(
            vault.totalAssets,
            asset?.metadata.decimals ?? 18,
          );

          return (
            <VaultListItem
              vaultAddress={vault.address}
              vaultName={vault.name}
              vaultSymbol={vault.symbol}
              operatorAddress={vault.operator}
              selectionMode={vault.selectionMode}
              blueprintCount={vault.blueprintIds.length}
              tvlText={tvl}
              tvlSymbol={asset?.metadata.symbol}
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
    </StyleContainer>
  );
};

export default LiquidStakingRedeemForm;
