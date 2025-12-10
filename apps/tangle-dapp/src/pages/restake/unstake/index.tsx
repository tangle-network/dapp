import { Cross1Icon } from '@radix-ui/react-icons';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { LockUnlockLineIcon } from '@tangle-network/icons/LockUnlockLineIcon';
import { Card, IconButton } from '@tangle-network/ui-components';
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
import { useAccount } from 'wagmi';
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
  type DelegationPosition,
  type UnstakeRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useScheduleUnstakeTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';

// Delegation item with metadata for selection
type DelegationItem = {
  id: string;
  operatorAddress: Address;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  shares: bigint;
  lastKnownAmount: bigint;
  availableToUnstake: bigint; // shares minus pending unstakes
};

const RestakeUnstakeForm: FC = () => {
  const { address: userAddress } = useAccount();
  const [isUnstakeRequestTableOpen, setIsUnstakeRequestTableOpen] = useState(false);

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
  const { data: delegator, isLoading: isLoadingDelegator } = useDelegator(userAddress);

  // Get unique token addresses from delegations
  const tokenAddresses = useMemo(() => {
    if (!delegator?.delegations) return [];
    const addresses = new Set<EvmAddress>();
    delegator.delegations.forEach((d) => addresses.add(d.token as EvmAddress));
    return Array.from(addresses);
  }, [delegator?.delegations]);

  // Fetch token metadata
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses);

  const [selectedDelegation, setSelectedDelegation] = useState<DelegationItem | null>(null);

  const selectedAssetId = watch('assetId');
  const selectedOperatorAddress = watch('operatorAddress');
  const amount = watch('amount');

  // Build delegation items with metadata
  const delegationItems = useMemo<DelegationItem[]>(() => {
    if (!delegator?.delegations || !tokenMetadatas) {
      return [];
    }

    return delegator.delegations
      .map((delegation) => {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === delegation.token.toLowerCase(),
        );

        if (!metadata) return null;

        // Calculate available to unstake (shares minus pending unstakes)
        const pendingUnstakes = delegator.unstakeRequests
          .filter(
            (req) =>
              req.operatorId.toLowerCase() === delegation.operatorId.toLowerCase() &&
              req.token.toLowerCase() === delegation.token.toLowerCase() &&
              req.status === 'PENDING',
          )
          .reduce((sum, req) => sum + req.shares, 0n);

        const availableToUnstake = delegation.shares > pendingUnstakes
          ? delegation.shares - pendingUnstakes
          : 0n;

        // Only show delegations with available shares
        if (availableToUnstake <= 0n) return null;

        return {
          id: delegation.id,
          operatorAddress: delegation.operatorId,
          token: delegation.token,
          tokenSymbol: metadata.symbol,
          tokenDecimals: metadata.decimals,
          shares: delegation.shares,
          lastKnownAmount: delegation.lastKnownAmount,
          availableToUnstake,
        };
      })
      .filter((item): item is DelegationItem => item !== null);
  }, [delegator?.delegations, delegator?.unstakeRequests, tokenMetadatas]);

  // Get pending unstake requests
  const unstakeRequests = useMemo(() => {
    return delegator?.unstakeRequests.filter((r) => r.status === 'PENDING') ?? [];
  }, [delegator?.unstakeRequests]);

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
          if (parsed <= 0n) return 'Amount must be greater than 0';
          if (maxAmount && parsed > maxAmount) return 'Exceeds available amount';
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

  const isTransacting =
    isSubmitting || unstakeTxStatus === TxStatus.PROCESSING;

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
          shares: amountBigInt,
        });
        resetForm();
      } catch (error) {
        console.error('Transaction failed:', error);
      }
    },
    [executeScheduleUnstake, isReady, resetForm, selectedDelegation],
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
                            <div className="flex flex-col">
                              <span className="font-mono text-sm">
                                {selectedDelegation.operatorAddress.slice(0, 8)}...
                                {selectedDelegation.operatorAddress.slice(-6)}
                              </span>
                              <span className="text-xs text-mono-100">
                                {selectedDelegation.tokenSymbol}
                              </span>
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
                                <Typography variant="h5" fw="bold">
                                  {selectedDelegation.tokenSymbol}
                                </Typography>
                                <div className="flex flex-col gap-1">
                                  <Typography
                                    variant="body2"
                                    className="text-mono-120 dark:text-mono-100"
                                  >
                                    Available: {formattedMaxAmount}{' '}
                                    {selectedDelegation.tokenSymbol}
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
        />
      </AnimatedTable>

      <UnstakeRequestsView
        unstakeRequests={unstakeRequests}
        tokenMetadatas={tokenMetadatas}
        onClose={() => setIsUnstakeRequestTableOpen(false)}
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
        renderItem={(item) => (
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-mono text-sm">
                {item.operatorAddress.slice(0, 10)}...{item.operatorAddress.slice(-8)}
              </span>
              <span className="text-xs text-mono-100">{item.tokenSymbol}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {formatUnits(item.availableToUnstake, item.tokenDecimals)}
              </span>
              <span className="text-xs text-mono-100">Available</span>
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
    </div>
  );
};

export default RestakeUnstakeForm;

// Unstake requests view component
type UnstakeRequestsViewProps = {
  unstakeRequests: UnstakeRequest[];
  tokenMetadatas: Array<{ id: EvmAddress; symbol: string; decimals: number }> | undefined;
  onClose: () => void;
  className?: string;
};

const UnstakeRequestsView: FC<UnstakeRequestsViewProps> = ({
  unstakeRequests,
  tokenMetadatas,
  onClose,
  className,
}) => {
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

        <IconButton onClick={onClose}>
          <Cross1Icon />
        </IconButton>
      </div>

      {unstakeRequests.length > 0 ? (
        <div className="space-y-2">
          {unstakeRequests.map((request) => {
            const metadata = tokenMetadatas?.find(
              (m) => m.id.toLowerCase() === request.token.toLowerCase(),
            );

            return (
              <div
                key={request.id}
                className="p-3 border rounded-lg border-mono-60 dark:border-mono-140"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-mono text-xs">
                      {request.operatorId.slice(0, 8)}...{request.operatorId.slice(-6)}
                    </span>
                    <span className="text-sm font-medium">
                      {metadata
                        ? formatUnits(request.estimatedAmount, metadata.decimals)
                        : request.estimatedAmount.toString()}{' '}
                      {metadata?.symbol ?? 'tokens'}
                    </span>
                  </div>
                  <div className="text-xs text-mono-100">
                    Ready at round {request.readyAtRound.toString()}
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
          Your requests will appear here after scheduling an unstake.
          Requests can be executed after the waiting period.
        </Typography>
      )}
    </RestakeDetailCard.Root>
  );
};
