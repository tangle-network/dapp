'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import type {
  ChainType,
  TokenListCardProps,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import entries from 'lodash/entries';
import keys from 'lodash/keys';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';

import { useRestakeContext } from '../../../context/RestakeContext';
import {
  DelegatorStakeContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeDelegatorInfo from '../../../data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti, {
  type Props,
} from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import ViewTxOnExplorer from '../../../data/restake/ViewTxOnExplorer';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { useRpcSubscription } from '../../../hooks/usePolkadotApi';
import { PagePath, QueryParamKey } from '../../../types';
import type { DelegationFormFields } from '../../../types/restake';
import AssetList from '../AssetList';
import AvatarWithText from '../AvatarWithText';
import Form from '../Form';
import ModalContent from '../ModalContent';
import OperatorList from '../OperatorList';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import Info from './Info';
import StakeInput from './StakeInput';

export const dynamic = 'force-static';

export default function Page() {
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DelegationFormFields>({
    mode: 'onBlur',
  });

  const [operatorParam] = useQueryState(QueryParamKey.RESTAKE_OPERATOR);

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
  const { stake: delegate } = useRestakeTx();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();
  const { result: operatorIdentities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );

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

  useEffect(() => {
    if (!operatorParam) return;

    if (!operatorMap[operatorParam]) return;

    setFormValue('operatorAccountId', operatorParam);
  }, [operatorMap, operatorParam, setFormValue]);

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

  const selectableTokens = useMemo(() => {
    if (!isDefined(delegatorInfo)) {
      return [];
    }

    return entries(delegatorInfo.deposits)
      .filter(([assetId]) => Boolean(assetMap[assetId]))
      .map(([assetId, { amount }]) => {
        const asset = assetMap[assetId];

        return {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          assetBalanceProps: {
            balance: +formatUnits(amount, asset.decimals),
            ...(asset.poolId
              ? {
                  subContent: `Pool ID: ${asset.poolId}`,
                }
              : {}),
          },
        } satisfies TokenListCardProps['selectTokens'][number];
      });
  }, [assetMap, delegatorInfo]);

  const handleAssetChange = useCallback(
    (asset: TokenListCardProps['selectTokens'][number]) => {
      setValue('assetId', asset.id);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

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

  const options = useMemo<Props<DelegatorStakeContext>>(() => {
    return {
      options: {
        [TxEvent.SUCCESS]: {
          secondaryMessage: (
            { amount, assetId, operatorAccount },
            explorerUrl,
          ) => (
            <ViewTxOnExplorer url={explorerUrl}>
              Successfully delegated{' '}
              {formatUnits(amount, assetMap[assetId].decimals)}{' '}
              {assetMap[assetId].symbol} to{' '}
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

  const txEventHandlers = useRestakeTxEventHandlersWithNoti(options);

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
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col h-full space-y-4 grow">
        <StakeInput
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
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <Modal>
        <ModalContent
          isOpen={isAssetModalOpen}
          title="Select Asset"
          description="Select the asset you want to delegate"
          onInteractOutside={closeAssetModal}
        >
          <AssetList
            selectTokens={selectableTokens}
            onChange={handleAssetChange}
            onClose={closeAssetModal}
            renderEmpty={EmptyAsset}
          />
        </ModalContent>

        <ModalContent
          isOpen={isOperatorModalOpen}
          title="Select Operator"
          description="Select the operator you want to stake with"
          onInteractOutside={closeOperatorModal}
        >
          <OperatorList
            selectedOperatorAccountId={watch('operatorAccountId')}
            onOperatorAccountIdChange={handleOperatorAccountIdChange}
            operatorMap={operatorMap}
            operatorIdentities={operatorIdentities}
            onClose={closeOperatorModal}
          />
        </ModalContent>

        <SupportedChainModal
          isOpen={isChainModalOpen}
          onClose={closeChainModal}
          onChainChange={handleChainChange}
        />
      </Modal>
    </Form>
  );
}

/** @internal */
const EmptyAsset = () => (
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
);
