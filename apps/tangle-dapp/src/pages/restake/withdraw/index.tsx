import { BN } from '@polkadot/util';
import { Cross1Icon } from '@radix-ui/react-icons';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import { ZERO_BIG_INT } from '@tangle-network/dapp-config/constants';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { ChainIcon } from '@tangle-network/icons/ChainIcon';
import LockFillIcon from '@tangle-network/icons/LockFillIcon';
import { LockLineIcon } from '@tangle-network/icons/LockLineIcon';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import { Card, IconButton } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import type { TextFieldInputProps } from '@tangle-network/ui-components/components/TextField/types';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits } from 'viem';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import WithdrawModal from '../../../containers/restaking/WithdrawModal';
import WithdrawRequestTable from '../../../containers/restaking/WithdrawRequestTable';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { WithdrawFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import parseChainUnits from '../../../utils/parseChainUnits';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import Details from './Details';
import {
  DelegatorWithdrawRequest,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';
import { twMerge } from 'tailwind-merge';
import calculateRestakeAvailableBalance from '../../../utils/restaking/calculateRestakeAvailableBalance';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

type Props = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
};

const RestakeWithdrawForm: FC<Props> = ({ assets }) => {
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<WithdrawFormFields>({
    mode: 'onBlur',
  });

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();
  const { activeChain } = useWebContext();

  const {
    status: isWithdrawModalOpen,
    open: openWithdrawModal,
    close: closeWithdrawModal,
    update: updateWithdrawModal,
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

  const { result: delegatorInfo } = useRestakeDelegatorInfo();

  const selectedAssetId = watch('assetId');
  const amount = watch('amount');

  const withdrawRequests = useMemo(() => {
    if (!delegatorInfo?.withdrawRequests) {
      return [];
    }

    return delegatorInfo.withdrawRequests;
  }, [delegatorInfo?.withdrawRequests]);

  const selectedAsset = useMemo(() => {
    return assets?.get(selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!delegatorInfo?.deposits || selectedAsset === null) {
      return {};
    }

    const availableBalance = calculateRestakeAvailableBalance(
      delegatorInfo,
      selectedAssetId,
    );

    if (availableBalance === null) {
      return {};
    }

    const fmtAvailableBalance = Number(
      formatUnits(availableBalance, selectedAsset.metadata.decimals),
    );

    return {
      maxAmount: availableBalance,
      formattedMaxAmount: fmtAvailableBalance,
    };
  }, [delegatorInfo, selectedAsset, selectedAssetId]);

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAsset?.metadata.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: getAmountValidation(
          step,
          step,
          ZERO_BIG_INT,
          maxAmount,
          selectedAsset?.metadata.decimals,
          selectedAsset?.metadata.symbol,
        ),
      }),
    };
  }, [
    maxAmount,
    register,
    selectedAsset?.metadata.decimals,
    selectedAsset?.metadata.symbol,
  ]);

  const displayError = useMemo(() => {
    return errors.assetId !== undefined || !selectedAssetId
      ? 'Select Asset'
      : !amount
        ? 'Enter an amount'
        : errors.amount !== undefined
          ? 'Invalid amount'
          : undefined;
  }, [errors.assetId, errors.amount, selectedAssetId, amount]);

  const restakeApi = useRestakeApi();

  const isReady =
    restakeApi !== null && !isSubmitting && selectedAsset !== null;

  const onSubmit = useCallback<SubmitHandler<WithdrawFormFields>>(
    async ({ amount, assetId }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, selectedAsset.metadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      if (!restakeApi) return;
      await restakeApi.withdraw(assetId, amountBn);

      setFormValue('amount', '', { shouldValidate: false });
      setFormValue('assetId', '0x0', { shouldValidate: false });
    },
    [isReady, restakeApi, selectedAsset?.metadata.decimals, setFormValue],
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
                tokenSymbol={selectedAsset?.metadata.symbol}
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
                  />
                </TransactionInputCard.Header>

                <TransactionInputCard.Body
                  customAmountProps={customAmountProps}
                  tokenSelectorProps={
                    useRef({
                      placeholder: <AssetPlaceholder />,
                      onClick: openWithdrawModal,
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
                    isLoading={isSubmitting || isLoading}
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
          onClose={() => setIsWithdrawRequestTableOpen(false)}
        />
      </AnimatedTable>

      <WithdrawRequestView
        withdrawRequests={withdrawRequests}
        onClose={() => setIsWithdrawRequestTableOpen(false)}
        className="md:hidden"
      />

      <WithdrawModal
        delegatorInfo={delegatorInfo}
        isOpen={isWithdrawModalOpen}
        setIsOpen={updateWithdrawModal}
        onItemSelected={({ formattedAmount, assetId }) => {
          closeWithdrawModal();

          const commonOpts = {
            shouldDirty: true,
            shouldValidate: true,
          };

          setFormValue('assetId', assetId, commonOpts);
          setFormValue('amount', formattedAmount, commonOpts);
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

export default RestakeWithdrawForm;

const WithdrawRequestView = ({
  withdrawRequests,
  onClose,
  className,
}: {
  withdrawRequests: DelegatorWithdrawRequest[];
  onClose: () => void;
  className?: string;
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
        <WithdrawRequestTable withdrawRequests={withdrawRequests} />
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
