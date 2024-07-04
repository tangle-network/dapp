'use client';

import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useSubscription } from 'observable-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { parseUnits } from 'viem';

import useRestakeTxEventHandlersWithNoti from '../../..//data/restake/useRestakeTxEventHandlersWithNoti';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import type { TxEventHandlers } from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import { DepositFormFields } from '../../../types/restake';
import ChainList from '../ChainList';
import RestakeTabs from '../RestakeTabs';
import SlideAnimation from '../SlideAnimation';
import ActionButton from './ActionButton';
import DestChainInput from './DestChainInput';
import SourceChainInput from './SourceChainInput';
import TokenList from './TokenList';
import TxDetails from './TxDetails';

export default function DepositPage() {
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    setValue,
    resetField,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
    defaultValues: {
      sourceTypedChainId: SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0],
    },
  });

  const { setCustomRpc } = usePolkadotApi();
  const { assetMap, assetWithBalances$ } = useRestakeContext();
  const { deposit } = useRestakeTx();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetWithBalances$, (assets) => {
    if (assets.length === 0) {
      return;
    }

    const defaultAssetId = assets[0].assetId;
    setValue('depositAssetId', defaultAssetId, {
      shouldDirty: true,
      shouldValidate: true,
    });
  });

  // Register fields render on modal on mount
  useEffect(() => {
    register('depositAssetId', { required: 'Asset is required' });
    register('sourceTypedChainId', { required: 'Chain is required' });
  }, [register]);

  const sourceTypedChainId = watch('sourceTypedChainId');

  // Subscribe to sourceTypedChainId and update customRpc
  useEffect(() => {
    const chain = chainsPopulated[sourceTypedChainId];
    setCustomRpc(chain?.rpcUrls.default.webSocket?.[0]);
  }, [setCustomRpc, sourceTypedChainId]);

  // Modal states
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  // Chain modal handlers
  const openChainModal = useCallback(() => setChainModalOpen(true), []);
  const closeChainModal = useCallback(() => setChainModalOpen(false), []);

  // Token modal handlers
  const openTokenModal = useCallback(() => setTokenModalOpen(true), []);
  const closeTokenModal = useCallback(() => setTokenModalOpen(false), []);

  const txEventHandlers = useRestakeTxEventHandlersWithNoti(
    useRef<TxEventHandlers>({
      onTxSuccess: () => resetField('amount'),
    }).current,
  );

  const handleChainChange = useCallback(
    ({ typedChainId }: ChainType) => {
      setValue('sourceTypedChainId', typedChainId, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setChainModalOpen(false);
    },
    [setValue],
  );

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async (data) => {
      const { amount, depositAssetId } = data;
      if (depositAssetId === null || assetMap[depositAssetId] === undefined) {
        return;
      }

      const asset = assetMap[depositAssetId];

      await deposit(
        depositAssetId,
        parseUnits(amount, asset.decimals),
        txEventHandlers,
      );
    },
    [assetMap, deposit, txEventHandlers],
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="relative h-full overflow-hidden"
    >
      <div className="flex flex-col h-full space-y-4 grow">
        <RestakeTabs />

        <div className="space-y-2">
          <SourceChainInput
            amountError={errors.amount?.message}
            openChainModal={openChainModal}
            openTokenModal={openTokenModal}
            register={register}
            setValue={setValue}
            watch={watch}
          />

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <DestChainInput />
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <TxDetails watch={watch} />

          <ActionButton
            errors={errors}
            formRef={formRef}
            isSubmitting={isSubmitting}
            isValid={isValid}
            watch={watch}
          />
        </div>
      </div>

      <SlideAnimation show={chainModalOpen} className="absolute">
        <ChainList
          selectedTypedChainId={watch('sourceTypedChainId')}
          className="h-full"
          onClose={closeChainModal}
          onChange={handleChainChange}
        />
      </SlideAnimation>

      <SlideAnimation show={tokenModalOpen} className="absolute">
        <TokenList
          setValue={setValue}
          className="h-full"
          onClose={closeTokenModal}
        />
      </SlideAnimation>
    </form>
  );
}
