'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import keys from 'lodash/keys';
import { useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import type { DelegationFormFields } from '../../../types/restake';
import RestakeTabs from '../RestakeTabs';
import DelegationInput from './DelegationInput';

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

        <div className="space-y-2">
          <DelegationInput
            amountError={errors.amount?.message}
            delegatorInfo={delegatorInfo}
            register={register}
            setValue={setValue}
            watch={watch}
          />
        </div>

        <div className="flex flex-col justify-between gap-4 grow">
          <FeeDetails
            isDefaultOpen
            items={[
              {
                name: 'Unstake period',
                info: 'Number of rounds that delegators remain bonded before the exit request is executable.',
              },
            ]}
          />

          <Button isFullWidth type="submit">
            Delegate
          </Button>
        </div>
      </div>
    </form>
  );
}
