import { Cross1Icon } from '@radix-ui/react-icons';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import {
  Card,
  IconButton,
  useBreakpointValue,
} from '@webb-tools/webb-ui-components';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import ErrorMessage from '../../../components/ErrorMessage';
import RestakeDetailCard from '../../../components/RestakeDetailCard';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import {
  type ScheduleDelegatorUnstakeContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import type { Props } from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import ViewTxOnExplorer from '../../../data/restake/ViewTxOnExplorer';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import type { UnstakeFormFields } from '../../../types/restake';
import decimalsToStep from '../../../utils/decimalsToStep';
import { getAmountValidation } from '../../../utils/getAmountValidation';
import ActionButtonBase from '../ActionButtonBase';
import { AnimatedTable } from '../AnimatedTable';
import AssetPlaceholder from '../AssetPlaceholder';
import { ExpandTableButton } from '../ExpandTableButton';
import RestakeTabs from '../RestakeTabs';
import StyleContainer from '../StyleContainer';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import TxInfo from './TxInfo';
import UnstakeModal from './UnstakeModal';
import UnstakeRequestTable from './UnstakeRequestTable';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

const Page = () => {
  const [isUnstakeRequestTableOpen, setIsUnstakeRequestTableOpen] =
    useState(false);

  const isMediumScreen = useBreakpointValue('md', true, false);

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UnstakeFormFields>({
    mode: 'onBlur',
  });

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();
  const { assetMap } = useRestakeContext();

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
    update: updateOperatorModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  // Register form fields on mount
  useEffect(() => {
    register('operatorAccountId', { required: true });
    register('assetId', { required: true });
  }, [register]);

  // Reset form when active chain changes
  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  const { delegatorInfo } = useRestakeDelegatorInfo();

  const { result: operatorIdentities } = useIdentities(
    useMemo(
      () =>
        delegatorInfo?.delegations?.map((item) => item.operatorAccountId) ?? [],
      [delegatorInfo?.delegations],
    ),
  );

  const selectedAssetId = watch('assetId');
  const selectedOperatorAccountId = watch('operatorAccountId');
  const amount = watch('amount');

  const unstakeRequests = useMemo(() => {
    if (!delegatorInfo?.unstakeRequests) return [];

    return delegatorInfo.unstakeRequests;
  }, [delegatorInfo?.unstakeRequests]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    if (!assetMap[selectedAssetId]) return null;

    return assetMap[selectedAssetId];
  }, [assetMap, selectedAssetId]);

  const { maxAmount, formattedMaxAmount } = useMemo(
    () => {
      if (!Array.isArray(delegatorInfo?.delegations)) return {};

      const selectedDelegation = delegatorInfo.delegations.find(
        (item) =>
          item.assetId === selectedAssetId &&
          item.operatorAccountId === selectedOperatorAccountId,
      );

      if (!selectedDelegation) return {};
      if (!assetMap[selectedDelegation.assetId]) return {};

      const maxAmount = selectedDelegation.amountBonded;
      const formattedMaxAmount = Number(
        formatUnits(maxAmount, assetMap[selectedDelegation.assetId].decimals),
      );

      return {
        maxAmount,
        formattedMaxAmount,
      };
    },
    // prettier-ignore
    [delegatorInfo?.delegations, assetMap, selectedAssetId, selectedOperatorAccountId],
  );

  const customAmountProps = useMemo<TextFieldInputProps>(() => {
    const step = decimalsToStep(selectedAsset?.decimals);

    return {
      type: 'number',
      step,
      ...register('amount', {
        required: 'Amount is required',
        validate: getAmountValidation(
          step,
          '0',
          ZERO_BIG_INT,
          maxAmount,
          selectedAsset?.decimals,
          selectedAsset?.symbol,
        ),
      }),
    };
  }, [maxAmount, register, selectedAsset?.decimals, selectedAsset?.symbol]);

  const displayError = useMemo(
    () => {
      return errors.operatorAccountId !== undefined ||
        !selectedOperatorAccountId
        ? 'Select an operator'
        : errors.assetId !== undefined || !selectedAssetId
          ? 'Select an asset'
          : !amount
            ? 'Enter an amount'
            : errors.amount !== undefined
              ? 'Invalid amount'
              : undefined;
    },
    // prettier-ignore
    [errors.operatorAccountId, errors.assetId, errors.amount, selectedOperatorAccountId, selectedAssetId, amount],
  );

  const options = useMemo<Props<ScheduleDelegatorUnstakeContext>>(() => {
    return {
      options: {
        [TxEvent.SUCCESS]: {
          secondaryMessage: (
            { amount, assetId, operatorAccount },
            explorerUrl,
          ) => (
            <ViewTxOnExplorer url={explorerUrl}>
              Successfully scheduled unstake of{' '}
              {formatUnits(amount, assetMap[assetId].decimals)}{' '}
              {assetMap[assetId].symbol} from{' '}
              <AvatarWithText
                className="inline-flex"
                accountAddress={operatorAccount}
                identityName={operatorIdentities?.[operatorAccount]?.name}
                overrideAvatarProps={{ size: 'sm' }}
              />
            </ViewTxOnExplorer>
          ),
        },
      },
      onTxSuccess: () => reset(),
    };
  }, [assetMap, operatorIdentities, reset]);

  const { scheduleDelegatorUnstake: scheduleDelegatorBondLess } =
    useRestakeTx();
  const txEventHandlers = useRestakeTxEventHandlersWithNoti(options);

  const onSubmit = useCallback<SubmitHandler<UnstakeFormFields>>(
    async (data) => {
      const { amount, assetId, operatorAccountId } = data;
      if (!assetId || !isDefined(assetMap[assetId])) {
        return;
      }

      const asset = assetMap[assetId];

      await scheduleDelegatorBondLess(
        operatorAccountId,
        assetId,
        parseUnits(amount, asset.decimals),
        txEventHandlers,
      );
    },
    [assetMap, scheduleDelegatorBondLess, txEventHandlers],
  );

  return (
    <div
      className={cx(
        'grid gap-4 place-content-center',
        !isMediumScreen ? 'grid-cols-1' : 'grid-flow-col auto-cols-fr',
      )}
    >
      <StyleContainer
        className={cx(
          isUnstakeRequestTableOpen && isMediumScreen
            ? 'ml-auto mr-0'
            : 'mx-auto',
        )}
      >
        <RestakeTabs />

        <Card withShadow className="relative">
          {!isUnstakeRequestTableOpen && isMediumScreen && (
            <ExpandTableButton
              className="absolute top-0 -right-10"
              tooltipContent="Open unstake requests table"
              onClick={() => setIsUnstakeRequestTableOpen(true)}
            />
          )}

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <TransactionInputCard.Root tokenSymbol={selectedAsset?.symbol}>
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select"
                  onClick={openOperatorModal}
                  {...(selectedOperatorAccountId
                    ? {
                        renderBody: () => (
                          <AvatarWithText
                            accountAddress={selectedOperatorAccountId}
                            identityName={
                              operatorIdentities?.[selectedOperatorAccountId]
                                ?.name
                            }
                            overrideTypographyProps={{ variant: 'h5' }}
                          />
                        ),
                      }
                    : {})}
                />
                <TransactionInputCard.MaxAmountButton
                  maxAmount={formattedMaxAmount}
                  tooltipBody="Staked Balance"
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
                    isDisabled: true,
                  }).current
                }
              />

              <ErrorMessage>{errors.amount?.message}</ErrorMessage>
            </TransactionInputCard.Root>

            <TxInfo />

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
                    isDisabled={!isValid || isDefined(displayError)}
                    type="submit"
                    isFullWidth
                    isLoading={isSubmitting || isLoading}
                    loadingText={
                      isSubmitting ? 'Sending transaction...' : loadingText
                    }
                  >
                    {displayError ?? 'Schedule Unstake'}
                  </Button>
                );
              }}
            </ActionButtonBase>
          </form>
        </Card>
      </StyleContainer>

      <AnimatedTable
        isTableOpen={isUnstakeRequestTableOpen}
        isMediumScreen={isMediumScreen}
      >
        <RestakeDetailCard.Root className="md:mt-[61px]">
          <div className="flex items-center justify-between">
            <RestakeDetailCard.Header
              title={
                unstakeRequests.length > 0
                  ? 'Unstake Requests'
                  : 'No Unstake Requests'
              }
            />

            <IconButton onClick={() => setIsUnstakeRequestTableOpen(false)}>
              <Cross1Icon />
            </IconButton>
          </div>

          {unstakeRequests.length > 0 ? (
            <UnstakeRequestTable
              operatorIdentities={operatorIdentities}
              unstakeRequests={unstakeRequests}
            />
          ) : (
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              You will be able to withdraw your tokens after the unstake request
              has been processed. To unstake your tokens go to the unstake tab
              to schedule a request.
            </Typography>
          )}
        </RestakeDetailCard.Root>
      </AnimatedTable>

      <Modal open={isOperatorModalOpen} onOpenChange={updateOperatorModal}>
        <UnstakeModal
          delegatorInfo={delegatorInfo}
          onClose={closeOperatorModal}
          operatorIdentities={operatorIdentities}
          onItemSelected={(item) => {
            closeOperatorModal();

            const { formattedAmount, assetId, operatorAccountId } = item;
            const commonOpts = {
              shouldDirty: true,
              shouldValidate: true,
            };

            setFormValue(
              'operatorAccountId',
              operatorAccountId as SubstrateAddress,
              commonOpts,
            );
            setFormValue('assetId', assetId, commonOpts);
            setFormValue('amount', formattedAmount, commonOpts);
          }}
        />
      </Modal>

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

export default Page;
