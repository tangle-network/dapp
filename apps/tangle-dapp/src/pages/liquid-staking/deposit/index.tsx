import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
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
import { erc20Abi, maxUint256, parseUnits, formatUnits, Address } from 'viem';
import { useAccount, useChainId, useReadContract } from 'wagmi';
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

type DepositFormFields = {
  vaultAddress: Address;
  amount: string;
};

const LiquidStakingDepositForm: FC = () => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const _activeChain = useMemo(() => {
    return Object.values(chainsConfig).find((c) => c.id === chainId);
  }, [chainId]);

  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { vaults, isLoading: isLoadingVaults } = useLiquidDelegationVaults();
  const { assets, refetchBalances } = useRestakeAssets();
  const { status: depositStatus, execute: executeDeposit } = useVaultDeposit();

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
    return assets.get(selectedVault.asset) ?? null;
  }, [selectedVault, assets]);

  const parsedAmount = useMemo(() => {
    if (!vaultAsset || !amount) return null;
    try {
      const value = parseUnits(amount, vaultAsset.metadata.decimals);
      return value > BigInt(0) ? value : null;
    } catch {
      return null;
    }
  }, [amount, vaultAsset]);

  const spender = selectedVault?.address ?? null;

  const {
    data: allowance,
    isLoading: isLoadingAllowance,
    refetch: refetchAllowance,
  } = useReadContract({
    address: vaultAsset?.id,
    abi: erc20Abi,
    functionName: 'allowance',
    args:
      userAddress && spender
        ? ([userAddress, spender] as const)
        : undefined,
    query: {
      enabled: Boolean(userAddress) && Boolean(spender) && Boolean(vaultAsset) && parsedAmount !== null,
      staleTime: 10_000,
      refetchInterval: 30_000,
      refetchIntervalInBackground: true,
    },
  });

  const needsApproval =
    parsedAmount !== null &&
    spender !== null &&
    typeof allowance === 'bigint' &&
    allowance < parsedAmount;

  const { status: approveTxStatus, execute: executeApproveTx } = useContractWrite(
    erc20Abi,
    (ctx: { token: Address; spender: Address }) => ({
      address: ctx.token,
      abi: erc20Abi,
      functionName: 'approve' as const,
      args: [ctx.spender, maxUint256] as const,
    }),
    { getSuccessMessage: () => `Approval successful` },
  );

  const handleApprove = useCallback(async () => {
    if (!vaultAsset || !spender || !executeApproveTx) {
      return;
    }
    if (parsedAmount === null) {
      return;
    }

    await executeApproveTx({ token: vaultAsset.id, spender });
    await refetchAllowance();
  }, [executeApproveTx, parsedAmount, refetchAllowance, spender, vaultAsset]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!vaultAsset) {
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

      if (needsApproval) {
        await handleApprove();
        return;
      }

      await executeDeposit({
        vaultAddress: vault,
        amount: amountBigInt,
        receiver: userAddress,
      });

      setValue('amount', '', { shouldValidate: false });
      refetchBalances();
    },
    [
      handleApprove,
      isReady,
      userAddress,
      vaultAsset,
      executeDeposit,
      needsApproval,
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
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {selectedVault.operator.slice(0, 8)}...
                              {selectedVault.operator.slice(-6)}
                            </span>
                            <span className="text-xs text-mono-100">
                              {selectedVault.selectionMode === 0
                                ? 'All Blueprints'
                                : 'Fixed Blueprints'}
                            </span>
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
                    isDisabled: true,
                    ...(vaultAsset
                      ? {
                          renderBody: () => (
                            <Typography variant="h5" fw="bold">
                              {vaultAsset.metadata.symbol}
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
                    type={needsApproval ? 'button' : 'submit'}
                    isFullWidth
                    isLoading={
                      isTransacting || isApproving || isLoading || isLoadingAllowance
                    }
                    loadingText={loadingText}
                    onClick={needsApproval ? handleApprove : undefined}
                  >
                    {displayError ?? (needsApproval ? 'Approve' : 'Deposit')}
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
        items={vaults ?? []}
        isLoading={isLoadingVaults}
        renderItem={(vault) => {
          const asset = assets?.get(vault.asset);
          const tvl = formatUnits(
            vault.totalAssets,
            asset?.metadata.decimals ?? 18,
          );

          return (
            <div className="flex items-center justify-between w-full p-2">
              <div className="flex flex-col">
                <span className="font-mono text-sm">
                  {vault.operator.slice(0, 10)}...{vault.operator.slice(-8)}
                </span>
                <span className="text-xs text-mono-100">
                  {vault.selectionMode === 0
                    ? 'All Blueprints'
                    : `${vault.blueprintIds.length} Blueprints`}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm">
                  {tvl} {asset?.metadata.symbol ?? 'tokens'}
                </span>
                <span className="text-xs text-mono-100">TVL</span>
              </div>
            </div>
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
