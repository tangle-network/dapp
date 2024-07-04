'use client';

import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import type { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import keys from 'lodash/keys';
import Link from 'next/link';
import { useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
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
  const { operatorMap } = useRestakeOperatorMap();

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();

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

          <ActionButton openChainModal={openChainModal} />
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
