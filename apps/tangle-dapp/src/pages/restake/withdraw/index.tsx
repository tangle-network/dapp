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
import { Address, formatUnits, parseUnits } from 'viem';
import { BN } from '@polkadot/util';
import { useAccount, useChainId } from 'wagmi';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { EvmWithdrawFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import { twMerge } from 'tailwind-merge';

// EVM hooks
import {
  useDelegator,
  type WithdrawRequest,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useScheduleWithdrawTx } from '@tangle-network/tangle-shared-ui/data/tx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { useEvmAssetMetadatas } from '@tangle-network/tangle-shared-ui/hooks/useEvmAssetMetadatas';
import type { EvmAddress } from '@tangle-network/ui-components/types/address';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import AssetListItem from '../../../components/Lists/AssetListItem';

// Asset position item for selection
type AssetPositionItem = {
  id: string;
  token: Address;
  tokenSymbol: string;
  tokenDecimals: number;
  totalDeposited: bigint;
  delegatedAmount: bigint;
  availableToWithdraw: bigint; // deposited - delegated - pending withdrawals
};

const RestakeWithdrawForm: FC = () => {
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
  const { data: delegator } = useDelegator(userAddress);

  // Get unique token addresses from positions
  const tokenAddresses = useMemo(() => {
    if (!delegator?.assetPositions) return [];
    return delegator.assetPositions.map((p) => p.token as EvmAddress);
  }, [delegator?.assetPositions]);

  // Fetch token metadata
  const { data: tokenMetadatas } = useEvmAssetMetadatas(tokenAddresses);

  const [selectedAssetPosition, setSelectedAssetPosition] =
    useState<AssetPositionItem | null>(null);

  const selectedAssetId = watch('assetId');
  const amount = watch('amount');

  // Get pending withdraw requests
  const withdrawRequests = useMemo(() => {
    return (
      delegator?.withdrawRequests.filter((r) => r.status === 'PENDING') ?? []
    );
  }, [delegator?.withdrawRequests]);

  // Build asset position items with metadata
  const assetPositionItems = useMemo<AssetPositionItem[]>(() => {
    if (!delegator?.assetPositions || !tokenMetadatas) {
      return [];
    }

    return delegator.assetPositions
      .map((position) => {
        const metadata = tokenMetadatas.find(
          (m) => m.id.toLowerCase() === position.token.toLowerCase(),
        );

        if (!metadata) return null;

        // Calculate pending withdrawals for this token
        const pendingWithdrawals = delegator.withdrawRequests
          .filter(
            (req) =>
              req.token.toLowerCase() === position.token.toLowerCase() &&
              req.status === 'PENDING',
          )
          .reduce((sum, req) => sum + req.amount, BigInt(0));

        // Available = deposited - delegated - pending withdrawals
        const availableToWithdraw =
          position.totalDeposited -
          position.delegatedAmount -
          pendingWithdrawals;

        // Only show positions with available balance
        if (availableToWithdraw <= BigInt(0)) return null;

        return {
          id: position.id,
          token: position.token,
          tokenSymbol: metadata.symbol,
          tokenDecimals: metadata.decimals,
          totalDeposited: position.totalDeposited,
          delegatedAmount: position.delegatedAmount,
          availableToWithdraw,
        };
      })
      .filter((item): item is AssetPositionItem => item !== null);
  }, [delegator?.assetPositions, delegator?.withdrawRequests, tokenMetadatas]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!selectedAssetPosition) {
      return { maxAmount: undefined, formattedMaxAmount: undefined };
    }

    const formatted = Number(
      formatUnits(
        selectedAssetPosition.availableToWithdraw,
        selectedAssetPosition.tokenDecimals,
      ),
    );

    return {
      maxAmount: selectedAssetPosition.availableToWithdraw,
      formattedMaxAmount: formatted,
    };
  }, [selectedAssetPosition]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAssetPosition?.tokenDecimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: (value) => {
          if (!selectedAssetPosition) return 'Select an asset first';
          const parsed = parseUnits(value, selectedAssetPosition.tokenDecimals);
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

      const amountBigInt = parseUnits(
        amount,
        selectedAssetPosition.tokenDecimals,
      );

      await executeScheduleWithdraw({
        token: assetId,
        amount: amountBigInt,
      });

      setFormValue('amount', '', { shouldValidate: false });
      setFormValue('assetId', '' as Address, { shouldValidate: false });
      setSelectedAssetPosition(null);
    },
    [executeScheduleWithdraw, isReady, selectedAssetPosition, setFormValue],
  );

  const handleAssetSelect = useCallback(
    (item: AssetPositionItem) => {
      setFormValue('assetId', item.token, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setSelectedAssetPosition(item);
      closeAssetModal();
    },
    [closeAssetModal, setFormValue],
  );

  return (
    <div className="grid items-start justify-center gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <StyleContainer>
        <RestakeActionTabs />

        <Card withShadow tightPadding className="relative md:min-w-[512px]">
          {!isWithdrawRequestTableOpen && (
            <ExpandTableButton
              className="absolute top-0 -right-10 max-md:hidden"
              tooltipContent="Withdrawal request"
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
                        setFormValue('amount', formattedMaxAmount.toString(), {
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
        />
      </AnimatedTable>

      <WithdrawRequestView
        withdrawRequests={withdrawRequests}
        tokenMetadatas={tokenMetadatas}
        onClose={() => setIsWithdrawRequestTableOpen(false)}
        className="md:hidden"
      />

      <ListModal
        title="Select Asset"
        isOpen={isAssetModalOpen}
        setIsOpen={updateAssetModal}
        titleWhenEmpty="No Assets Available"
        descriptionWhenEmpty="You don't have any deposited assets available to withdraw."
        items={assetPositionItems}
        searchInputId="restake-withdraw-asset-search"
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
            balance={new BN(item.availableToWithdraw.toString())}
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

export default RestakeWithdrawForm;

// Withdraw requests view component
type WithdrawRequestViewProps = {
  withdrawRequests: WithdrawRequest[];
  tokenMetadatas:
    | Array<{ id: EvmAddress; symbol: string; decimals: number }>
    | undefined;
  onClose: () => void;
  className?: string;
};

const WithdrawRequestView: FC<WithdrawRequestViewProps> = ({
  withdrawRequests,
  tokenMetadatas,
  onClose,
  className,
}) => {
  return (
    <RestakeDetailCard.Root className={twMerge('!min-w-0', className)}>
      <div className="flex items-center justify-between">
        <RestakeDetailCard.Header
          title={
            withdrawRequests.length > 0
              ? 'Withdrawal Requests'
              : 'No Withdrawal Requests'
          }
        />

        <IconButton onClick={onClose}>
          <Cross1Icon />
        </IconButton>
      </div>

      {withdrawRequests.length > 0 ? (
        <div className="space-y-2">
          {withdrawRequests.map((request) => {
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
                    <span className="text-sm font-medium">
                      {metadata
                        ? formatUnits(request.amount, metadata.decimals)
                        : request.amount.toString()}{' '}
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
          Your requests will appear here after scheduling a withdrawal. Requests
          can be executed after the waiting period.
        </Typography>
      )}
    </RestakeDetailCard.Root>
  );
};
