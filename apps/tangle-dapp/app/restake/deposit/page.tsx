'use client';

import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { useSubscription } from 'observable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import usePolkadotApi from '../../../hooks/usePolkadotApi';
import { DepositFormFields } from '../../../types/restake';
import TabsList from '../TabsList';
import ActionButton from './ActionButton';
import ChainList from './ChainList';
import DestChainInput from './DestChainInput';
import SlideAnimation from './SlideAnimation';
import SourceChainInput from './SourceChainInput';
import TokenList from './TokenList';
import TxDetails from './TxDetails';

const onSubmit: SubmitHandler<DepositFormFields> = (data) => {
  console.log('Submitted data: ', data);
};

export default function DepositPage() {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
    defaultValues: {
      sourceTypedChainId: SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0],
    },
  });

  const { setCustomRpc } = usePolkadotApi();
  const { assetMap$ } = useRestakeContext();

  // Subscribe to assetMap$ and update depositAssetId to the first assetId
  useSubscription(assetMap$, (assetMap) => {
    if (Object.keys(assetMap).length === 0) {
      return;
    }

    const defaultAssetId = Object.keys(assetMap)[0];
    setValue('depositAssetId', defaultAssetId, { shouldDirty: true });
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="relative overflow-hidden"
    >
      <div className="flex flex-col space-y-4 grow">
        <TabsList />

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

          <ActionButton />
        </div>
      </div>

      <SlideAnimation show={chainModalOpen} className="absolute">
        <ChainList
          setValue={setValue}
          watch={watch}
          className="h-full"
          onClose={closeChainModal}
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
