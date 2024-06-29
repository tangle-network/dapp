'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { RelayerListCard } from '@webb-tools/webb-ui-components/components/ListCard';
import keys from 'lodash/keys';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import type { DelegationFormFields } from '../../../types/restake';
import RestakeTabs from '../RestakeTabs';
import SlideAnimation from '../SlideAnimation';
import AssetList from './AssetList';
import DelegationInput from './DelegationInput';
import Info from './Info';

export default function DelegatePage() {
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DelegationFormFields>({
    mode: 'onBlur',
  });

  // Register select fields on mount
  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAccountId', { required: 'Operator is required' });
  }, [register]);

  const { delegatorInfo } = useRestakeDelegatorInfo();

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
      setValue('assetId', defaultAssetId, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [defaultAssetId, setValue]);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);

  const openAssetModal = useCallback(() => setIsAssetModalOpen(true), []);
  const closeAssetModal = useCallback(() => setIsAssetModalOpen(false), []);

  const openOperatorModal = useCallback(() => setIsOperatorModalOpen(true), []);
  const closeOperatorModal = useCallback(
    () => setIsOperatorModalOpen(false),
    [],
  );

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>((data) => {
    console.log(data);
  }, []);

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

          <Button isFullWidth type="submit">
            Delegate
          </Button>
        </div>
      </div>

      <SlideAnimation show={isAssetModalOpen} className="absolute">
        <AssetList
          className="h-full"
          delegatorInfo={delegatorInfo}
          onClose={closeAssetModal}
          setValue={setValue}
        />
      </SlideAnimation>

      <SlideAnimation show={isOperatorModalOpen} className="absolute">
        <RelayerListCard
          overrideTitleProps={{ variant: 'h4' }}
          className="h-full dark:bg-[var(--restake-card-bg-dark)] p-0"
          relayers={[]}
          onClose={closeOperatorModal}
        />
      </SlideAnimation>
    </form>
  );
}
