'use client';

import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import type { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import keys from 'lodash/keys';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { parseUnits } from 'viem';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import type { TxEventHandlers } from '../../../data/restake/RestakeTx/base';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { useRpcSubscription } from '../../../hooks/usePolkadotApi';
import { PagePath } from '../../../types';
import type { DelegationFormFields } from '../../../types/restake';
import ChainList from '../ChainList';
import RestakeTabs from '../RestakeTabs';
import SlideAnimation from '../SlideAnimation';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import AssetList from './AssetList';
import DelegationInput from './DelegationInput';
import Info from './Info';
import OperatorList from './OperatorList';

export default function DelegatePage() {
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<DelegationFormFields>({
    mode: 'onBlur',
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

  // Register select fields on mount
  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAccountId', { required: 'Operator is required' });
  }, [register]);

  const { assetMap } = useRestakeContext();
  const { delegate } = useRestakeTx();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();

  useRpcSubscription(activeTypedChainId);

  // Set the default assetId to the first assetId in the depositedAssets
  const defaultAssetId = useMemo(() => {
    if (!isDefined(delegatorInfo)) {
      return null;
    }

    const assetIds = keys(delegatorInfo.deposits);
    if (assetIds.length === 0) {
      return null;
    }

    return assetIds[0];
  }, [delegatorInfo]);

  // Set the default assetId to the first deposited assets
  useEffect(() => {
    if (defaultAssetId !== null) {
      setValue('assetId', defaultAssetId);
    }
  }, [defaultAssetId, setValue]);

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
  } = useModal(false);

  const {
    status: isAssetModalOpen,
    open: openAssetModal,
    close: closeAssetModal,
  } = useModal(false);

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
  } = useModal(false);

  const handleChainChange = useCallback(
    async ({ typedChainId }: ChainType) => {
      await switchChain(typedChainId);
      closeChainModal();
    },
    [closeChainModal, switchChain],
  );

  const handleOperatorAccountIdChange = useCallback(
    (operatorAccountId: string) => {
      setValue('operatorAccountId', operatorAccountId);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  const txEventHandlers = useRestakeTxEventHandlersWithNoti(
    useRef<TxEventHandlers>({
      onTxSuccess: () => reset(),
    }).current,
  );

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>(
    async (data) => {
      const { amount, assetId, operatorAccountId } = data;
      if (!assetId || !isDefined(assetMap[assetId])) {
        return;
      }

      const asset = assetMap[assetId];

      await delegate(
        operatorAccountId,
        assetId,
        parseUnits(amount, asset.decimals),
        txEventHandlers,
      );
    },
    [assetMap, delegate, txEventHandlers],
  );

  return (
    <form
      className="relative h-full overflow-hidden"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col h-full space-y-4 grow">
        <RestakeTabs />

        <DelegationInput
          amountError={errors.amount?.message}
          delegatorInfo={delegatorInfo}
          openAssetModal={openAssetModal}
          openOperatorModal={openOperatorModal}
          register={register}
          setValue={setValue}
          watch={watch}
        />

        <div className="flex flex-col justify-between gap-4 grow">
          <Info />

          <ActionButton
            errors={errors}
            isValid={isValid}
            openChainModal={openChainModal}
            watch={watch}
          />
        </div>
      </div>

      <SlideAnimation show={isAssetModalOpen} className="absolute">
        <AssetList
          className="h-full"
          delegatorInfo={delegatorInfo}
          onClose={closeAssetModal}
          setValue={setValue}
          renderEmpty={() => (
            <div className="space-y-4">
              <Typography variant="h5" fw="bold" ta="center">
                No assets available
              </Typography>

              <Button
                as={Link}
                href={PagePath.RESTAKE_DEPOSIT}
                variant="link"
                className="block mx-auto text-center"
              >
                Deposit now
              </Button>
            </div>
          )}
        />
      </SlideAnimation>

      <SlideAnimation show={isOperatorModalOpen} className="absolute">
        <OperatorList
          selectedOperatorAccountId={watch('operatorAccountId')}
          onOperatorAccountIdChange={handleOperatorAccountIdChange}
          operatorMap={operatorMap}
          overrideTitleProps={{ variant: 'h4' }}
          className="h-full dark:bg-[var(--restake-card-bg-dark)] p-0"
          onClose={closeOperatorModal}
        />
      </SlideAnimation>

      <SlideAnimation show={isChainModalOpen} className="absolute">
        <ChainList
          selectedTypedChainId={activeTypedChainId}
          className="h-full"
          onClose={closeChainModal}
          onChange={handleChainChange}
          defaultCategory={
            chainsPopulated[SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0]].tag
          }
        />
      </SlideAnimation>
    </form>
  );
}
