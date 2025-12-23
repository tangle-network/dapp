import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { erc20Abi, parseUnits, formatUnits, Address, isAddress } from 'viem';
import { useAccount, useChainId } from 'wagmi';
import ErrorMessage from '../../../components/ErrorMessage';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import decimalsToStep from '../../../utils/decimalsToStep';
import AssetPlaceholder from '../../restake/AssetPlaceholder';
import SupportedChainModal from '../../restake/SupportedChainModal';
import useSwitchChain from '../../restake/useSwitchChain';
import LiquidStakingActionTabs from '../LiquidStakingActionTabs';
import {
  useLiquidDelegationVaults,
  useVaultDeposit,
  type LiquidDelegationVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useContractWrite } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import VaultListItem from '../../../components/Lists/VaultListItem';

type DepositFormFields = {
  vaultAddress: Address;
  amount: string;
};

const LiquidStakingDepositForm: FC = () => {
  const [searchParams] = useSearchParams();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const _activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { vaults, isLoading: isLoadingVaults } = useLiquidDelegationVaults();
  const { assets, refetchBalances } = useRestakeAssets();
  const {
    status: depositStatus,
    execute: executeDeposit,
    txHash: depositTxHash,
  } = useVaultDeposit();

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DepositFormFields>({
    mode: 'onChange',
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

  const vaultAsset = useMemo(() => {
    if (!selectedVault || !assets) {
      return null;
    }
    // Normalize to lowercase since indexer stores addresses in lowercase
    // but blockchain reads return checksummed (mixed-case) addresses
    const normalizedAsset = selectedVault.asset.toLowerCase() as Address;
    return assets.get(normalizedAsset) ?? null;
  }, [selectedVault, assets]);

  const spender = selectedVault?.address ?? null;

  const approveLastErrorRef = useRef<Error | null>(null);

  const {
    status: approveTxStatus,
    execute: executeApproveTx,
    txHash: approveTxHash,
  } = useContractWrite(
    erc20Abi,
    (ctx: { token: Address; spender: Address; amount: bigint }) => ({
      address: ctx.token,
      abi: erc20Abi,
      functionName: 'approve' as const,
      args: [ctx.spender, ctx.amount] as const,
    }),
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

  const handleApprove = useCallback(
    async (amountToApprove: bigint) => {
      if (!vaultAsset || !spender || !executeApproveTx) {
        return false;
      }

      approveLastErrorRef.current = null;
      const firstAttempt = await executeApproveTx({
        token: vaultAsset.id,
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

      const zeroAttempt = await executeApproveTx({
        token: vaultAsset.id,
        spender,
        amount: BigInt(0),
      });

      if (zeroAttempt === null) {
        return false;
      }

      const secondAttempt = await executeApproveTx({
        token: vaultAsset.id,
        spender,
        amount: amountToApprove,
      });

      return secondAttempt !== null;
    },
    [executeApproveTx, spender, vaultAsset],
  );

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!vaultAsset || vaultAsset.balance === null) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const formatted = Number(
      formatUnits(vaultAsset.balance, vaultAsset.metadata.decimals),
    );

    return {
      maxAmount: vaultAsset.balance,
      formattedMaxAmount: formatted,
    };
  }, [vaultAsset]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(vaultAsset?.metadata.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!vaultAsset) return 'Select a vault first';
          const parsed = parseUnits(value, vaultAsset.metadata.decimals);
          if (parsed <= BigInt(0)) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Insufficient balance';
          return true;
        },
      }),
    };
  }, [vaultAsset, maxAmount, register]);

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

  const isTransacting = isSubmitting || depositStatus === TxStatus.PROCESSING;
  const isApproving = approveTxStatus === TxStatus.PROCESSING;

  const isReady =
    executeDeposit !== null &&
    selectedVault !== null &&
    userAddress !== undefined &&
    !isTransacting &&
    !isApproving;

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async ({ vaultAddress: vault, amount }) => {
      if (!isReady || !userAddress || !vaultAsset) {
        return;
      }

      const amountBigInt = parseUnits(amount, vaultAsset.metadata.decimals);

      if (amountBigInt <= BigInt(0)) {
        return;
      }

      try {
        // Set allowance to exactly the deposit amount (never infinite approvals).
        if (!spender) return;
        setTxStep('approving');
        const approved = await handleApprove(amountBigInt);
        if (!approved) return;

        setTxStep('depositing');
        await executeDeposit({
          vaultAddress: vault,
          asset: vaultAsset.id,
          amount: amountBigInt,
          receiver: userAddress,
        });
      } finally {
        setTxStep('idle');
      }

      setValue('amount', '', { shouldValidate: false });
      refetchBalances();
    },
    [
      handleApprove,
      isReady,
      userAddress,
      vaultAsset,
      executeDeposit,
      spender,
      setValue,
      refetchBalances,
    ],
  );

  return (
    <StyleContainer>
      <LiquidStakingActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root
              tokenSymbol={vaultAsset?.metadata.symbol}
              className="bg-mono-20 dark:bg-mono-180"
            >
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
                  tooltipBody="Available Balance"
                  Icon={
                    useRef({
                      enabled: <LockLineIcon />,
                      disabled: <LockFillIcon />,
                    }).current
                  }
                  onAmountChange={(value) => {
                    setValue('amount', value, { shouldValidate: true });
                  }}
                />
              </TransactionInputCard.Header>

              <TransactionInputCard.Body
                customAmountProps={customAmountProps}
                tokenSelectorProps={{
                  placeholder: <AssetPlaceholder />,
                  isDisabled: true,
                }}
              />
            </TransactionInputCard.Root>

            <ErrorMessage>{errors.amount?.message}</ErrorMessage>
          </div>

          {selectedVault && (
            <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-160 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-mono-100">Total Value Locked</span>
                <span className="font-medium">
                  {formatUnits(
                    selectedVault.totalAssets,
                    vaultAsset?.metadata.decimals ?? 18,
                  )}{' '}
                  {vaultAsset?.metadata.symbol ?? 'tokens'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mono-100">Blueprint Mode</span>
                <span className="font-medium">
                  {selectedVault.selectionMode === 0
                    ? 'All Blueprints'
                    : 'Fixed Selection'}
                </span>
              </div>
            </div>
          )}

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
                  isLoading={isTransacting || isApproving || isLoading}
                  loadingText={
                    txStep === 'approving' &&
                    approveTxStatus === TxStatus.PROCESSING
                      ? approveTxHash === null
                        ? 'Preparing approval…'
                        : 'Waiting for approval…'
                      : txStep === 'depositing' &&
                          depositStatus === TxStatus.PROCESSING
                        ? depositTxHash === null
                          ? 'Preparing deposit…'
                          : 'Waiting for deposit…'
                        : loadingText
                  }
                >
                  {displayError ?? 'Approve & Deposit'}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </Card>

      <ListModal
        title="Select Vault"
        isOpen={vaultModalOpen}
        setIsOpen={updateVaultModal}
        onSelect={handleVaultSelection}
        filterItem={(vault, query) =>
          filterBy(query, [vault.address, vault.operator, vault.name])
        }
        searchInputId="liquid-staking-vault-search"
        searchPlaceholder="Search vaults..."
        titleWhenEmpty="No Vaults Found"
        descriptionWhenEmpty="No liquid delegation vaults are available. Please try again later."
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

export default LiquidStakingDepositForm;
