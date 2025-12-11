import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
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
import { parseUnits, formatUnits, Address } from 'viem';
import { useAccount } from 'wagmi';
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
  useVaultRequestRedeem,
  useVaultUserPosition,
  type LiquidDelegationVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';

type RedeemFormFields = {
  vaultAddress: Address;
  amount: string;
};

const LiquidStakingRedeemForm: FC = () => {
  const { address: userAddress } = useAccount();
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { vaults, isLoading: isLoadingVaults } = useLiquidDelegationVaults();
  const { assets } = useRestakeAssets();
  const { status: redeemStatus, execute: executeRedeem } =
    useVaultRequestRedeem();

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

  const { position } = useVaultUserPosition(selectedVault?.address);

  const vaultAsset = useMemo(() => {
    if (!selectedVault || !assets) {
      return null;
    }
    return assets.get(selectedVault.asset) ?? null;
  }, [selectedVault, assets]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!position) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const formatted = Number(formatUnits(position.balance, 18));

    return {
      maxAmount: position.balance,
      formattedMaxAmount: formatted,
    };
  }, [position]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(18);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!position) return 'Select a vault first';
          const parsed = parseUnits(value, 18);
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

  const isReady =
    executeRedeem !== null &&
    selectedVault !== null &&
    userAddress !== undefined &&
    position !== null &&
    !isTransacting;

  const onSubmit = useCallback<SubmitHandler<RedeemFormFields>>(
    async ({ vaultAddress: vault, amount }) => {
      if (!isReady || !userAddress) {
        return;
      }

      const sharesBigInt = parseUnits(amount, 18);

      if (sharesBigInt <= BigInt(0)) {
        return;
      }

      await executeRedeem({
        vaultAddress: vault,
        shares: sharesBigInt,
        controller: userAddress,
        owner: userAddress,
      });

      setValue('amount', '', { shouldValidate: false });
    },
    [isReady, userAddress, executeRedeem, setValue],
  );

  return (
    <StyleContainer>
      <LiquidStakingActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-start justify-stretch">
            <TransactionInputCard.Root
              tokenSymbol="ldTokens"
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
                  tooltipBody="Available Shares"
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
                    ...(selectedVault && formattedMaxAmount !== undefined
                      ? {
                          renderBody: () => (
                            <div className="flex items-center gap-2">
                              <Typography variant="h5" fw="bold">
                                ldTokens
                              </Typography>
                              <div className="flex flex-col gap-1">
                                <Typography
                                  variant="body2"
                                  className="text-mono-120 dark:text-mono-100"
                                >
                                  Available: {formattedMaxAmount}
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

          {selectedVault && position && (
            <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-160 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-mono-100">Your Balance</span>
                <span className="font-medium">
                  {formatUnits(position.balance, 18)} shares
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-mono-100">Value in Assets</span>
                <span className="font-medium">
                  {formatUnits(
                    position.balanceInAssets,
                    vaultAsset?.metadata.decimals ?? 18,
                  )}{' '}
                  {vaultAsset?.metadata.symbol ?? 'tokens'}
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

export default LiquidStakingRedeemForm;
