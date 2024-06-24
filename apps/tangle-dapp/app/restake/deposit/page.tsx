'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import Spinner from '@webb-tools/icons/Spinner';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { useSubscription } from 'observable-hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { parseUnits } from 'viem';

import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useExplorerUrl from '../../../hooks/useExplorerUrl';
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

enum NotificationKeys {
  TX_SENDING = 'tx-sending',
  TX_IN_BLOCK = 'tx-in-block',
  TX_SUCCESS = 'tx-success',
  TX_FAILED = 'tx-failed',
}

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

  const { activeChain } = useWebContext();
  const { notificationApi } = useWebbUI();
  const getExplorerUrl = useExplorerUrl();

  const { setCustomRpc } = usePolkadotApi();
  const { assetMap, assetMap$ } = useRestakeContext();
  const { deposit } = useRestakeTx();

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

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async (data) => {
      const { amount, depositAssetId } = data;
      if (depositAssetId === null || assetMap[depositAssetId] === undefined) {
        return;
      }

      const asset = assetMap[depositAssetId];

      await deposit(depositAssetId, parseUnits(amount, asset.decimals), {
        onTxSending: () => {
          notificationApi.addToQueue({
            key: NotificationKeys.TX_SENDING,
            Icon: <Spinner size="lg" />,
            message: 'Sending transaction...',
            variant: 'info',
            persist: true,
          });
        },
        onTxInBlock: (txHash) => {
          const url = getExplorerUrl(
            txHash,
            'tx',
            undefined,
            activeChain?.blockExplorers?.default.url,
          );

          notificationApi.remove(NotificationKeys.TX_SENDING);
          notificationApi.addToQueue({
            key: NotificationKeys.TX_IN_BLOCK,
            Icon: <Spinner size="lg" />,
            message: 'Transaction is included in a block',
            secondaryMessage: (
              <Typography variant="body1">
                View the transaction{' '}
                <Button
                  className="inline-block"
                  variant="link"
                  href={url?.toString()}
                  target="_blank"
                >
                  on the explorer
                </Button>
              </Typography>
            ),
            variant: 'info',
            persist: true,
          });
        },
        onTxSuccess: (txHash) => {
          const url = getExplorerUrl(
            txHash,
            'tx',
            undefined,
            activeChain?.blockExplorers?.default.url,
          );

          notificationApi.remove(NotificationKeys.TX_SENDING);
          notificationApi.remove(NotificationKeys.TX_IN_BLOCK);
          notificationApi.addToQueue({
            key: NotificationKeys.TX_SUCCESS,
            message: 'Transaction finalized!',
            secondaryMessage: (
              <Typography variant="body1">
                View the transaction{' '}
                <Button
                  className="inline-block"
                  variant="link"
                  href={url?.toString()}
                  target="_blank"
                >
                  on the explorer
                </Button>
              </Typography>
            ),
            variant: 'success',
          });

          resetField('amount');
        },
        onTxFailed(error) {
          notificationApi.remove(NotificationKeys.TX_SENDING);
          notificationApi.remove(NotificationKeys.TX_IN_BLOCK);
          notificationApi.addToQueue({
            key: NotificationKeys.TX_FAILED,
            message: 'Transaction failed!',
            secondaryMessage: (
              <Typography variant="body1" className="text-red-70">
                {error}
              </Typography>
            ),
            variant: 'error',
            persist: true,
          });
        },
      });
    },
    // prettier-ignore
    [activeChain?.blockExplorers?.default.url, assetMap, deposit, getExplorerUrl, notificationApi, resetField],
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className="relative h-full overflow-hidden"
    >
      <div className="flex flex-col h-full space-y-4 grow">
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
