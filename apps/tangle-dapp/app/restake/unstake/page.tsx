'use client';

import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import LockFillIcon from '@webb-tools/icons/LockFillIcon';
import { LockLineIcon } from '@webb-tools/icons/LockLineIcon';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import type { TextFieldInputProps } from '@webb-tools/webb-ui-components/components/TextField/types';
import { TransactionInputCard } from '@webb-tools/webb-ui-components/components/TransactionInputCard';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';

import RestakeDetailCard from '../../../components/RestakeDetailCard';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import {
  type DelegatorBondLessContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
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
import AssetPlaceholder from '../AssetPlaceholder';
import AvatarWithText from '../AvatarWithText';
import ErrorMessage from '../ErrorMessage';
import RestakeTabs from '../RestakeTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import TxInfo from './TxInfo';
import UnstakeModal from './UnstakeModal';
import UnstakeRequestTable from './UnstakeRequestTable';

const Page = () => {
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
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
  } = useModal();

  // Register form fields on mount
  useEffect(() => {
    register('operatorAccountId', { required: true });
    register('assetId', { required: true });
    register('uid', { required: true });
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
  const selectedUid = watch('uid');
  const amount = watch('amount');

  const delegatorBondLessRequests = useMemo(() => {
    if (!delegatorInfo?.delegatorBondLessRequest) return [];

    return [delegatorInfo.delegatorBondLessRequest];
  }, [delegatorInfo?.delegatorBondLessRequest]);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    if (!assetMap[selectedAssetId]) return null;

    return assetMap[selectedAssetId];
  }, [assetMap, selectedAssetId]);

  const { maxAmount, formattedMaxAmount } = useMemo(() => {
    if (!Array.isArray(delegatorInfo?.delegations)) return {};

    const selectedDelegation = delegatorInfo.delegations.find(
      (item) => item.uid === selectedUid,
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
  }, [delegatorInfo?.delegations, assetMap, selectedUid]);

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

  const options = useMemo<Props<DelegatorBondLessContext>>(() => {
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

  const { scheduleDelegatorBondLess } = useRestakeTx();
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
    <div className="grid items-start grid-cols-1 gap-4 sm:grid-cols-2 justify-stretch">
      <div className="max-w-lg">
        <RestakeTabs />

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
      </div>

      {/** Hardcoded for the margin top to ensure the component is align to same card content */}
      <RestakeDetailCard.Root className="max-w-lg sm:mt-[61px]">
        {delegatorBondLessRequests.length > 0 ? (
          <UnstakeRequestTable
            delegatorBondLessRequests={delegatorBondLessRequests}
          />
        ) : (
          <>
            <RestakeDetailCard.Header title="No unstake requests found" />

            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-100"
            >
              You will be able to withdraw your tokens after the unstake request
              has been processed. To unstake your tokens go to the unstake tab
              to schedule request.
            </Typography>
          </>
        )}
      </RestakeDetailCard.Root>

      <Modal>
        <UnstakeModal
          delegatorInfo={delegatorInfo}
          isOpen={isOperatorModalOpen}
          onClose={closeOperatorModal}
          operatorIdentities={operatorIdentities}
          onItemSelected={(item) => {
            closeOperatorModal();

            const { formattedAmount, assetId, operatorAccountId, uid } = item;
            const commonOpts = {
              shouldDirty: true,
              shouldValidate: true,
            };

            setFormValue('operatorAccountId', operatorAccountId, commonOpts);
            setFormValue('assetId', assetId, commonOpts);
            setFormValue('amount', formattedAmount, commonOpts);
            setFormValue('uid', uid, commonOpts);
          }}
        />

        <SupportedChainModal
          isOpen={isChainModalOpen}
          onClose={closeChainModal}
          onChainChange={async ({ typedChainId }) => {
            await switchChain(typedChainId);
            closeChainModal();
          }}
        />
      </Modal>
    </div>
  );
};

export default Page;
