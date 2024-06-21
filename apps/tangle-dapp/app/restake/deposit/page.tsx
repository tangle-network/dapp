'use client';

import { Transition } from '@headlessui/react';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import cx from 'classnames';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';

import { DepositFormFields } from '../../../types/restake';
import TabsList from '../TabsList';
import ActionButton from './ActionButton';
import ChainList from './ChainList';
import DestChainInput from './DestChainInput';
import SourceChainInput from './SourceChainInput';
import TxDetails from './TxDetails';

const onSubmit: SubmitHandler<DepositFormFields> = (data) => {
  console.log('Submitted data: ', data);
};

export default function DepositPage() {
  const [chainModalOpen, setChainModalOpen] = useState(false);

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
  });

  const openChainModal = useCallback(() => setChainModalOpen(true), []);
  const closeChainModal = useCallback(() => setChainModalOpen(false), []);

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

      <Transition
        as="div"
        className="absolute h-full"
        show={chainModalOpen}
        enter={cx('transition-[top,_opacity] duration-150')}
        enterFrom={cx('opacity-0 top-[250px]')}
        enterTo={cx('opacity-100 top-0')}
        leave={cx('transition-[top,_opacity] duration-150')}
        leaveFrom={cx('opacity-100 top-0')}
        leaveTo={cx('opacity-0 top-[250px]')}
      >
        <ChainList className="h-full" onClose={closeChainModal} />
      </Transition>
    </form>
  );
}
