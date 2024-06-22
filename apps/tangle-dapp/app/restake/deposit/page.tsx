'use client';

import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

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
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
  });

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
            openChainModal={openChainModal}
            openTokenModal={openTokenModal}
            register={register}
            setValue={setValue}
            amountError={errors.amount?.message}
          />

          <ArrowRight size="lg" className="mx-auto rotate-90" />

          <DestChainInput />
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <TxDetails />

          <ActionButton />
        </div>
      </div>

      <SlideAnimation show={chainModalOpen} className="absolute">
        <ChainList className="h-full" onClose={closeChainModal} />
      </SlideAnimation>

      <SlideAnimation show={tokenModalOpen} className="absolute">
        <TokenList className="h-full" onClose={closeTokenModal} />
      </SlideAnimation>
    </form>
  );
}
