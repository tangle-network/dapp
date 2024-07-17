'use client';

import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import {
  ChainType,
  type TokenListCardProps,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { formatUnits, parseUnits } from 'viem';

import useRestakeTxEventHandlersWithNoti, {
  type Props,
} from '../../..//data/restake/useRestakeTxEventHandlersWithNoti';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import {
  type DepositContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import ViewTxOnExplorer from '../../../data/restake/ViewTxOnExplorer';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { useRpcSubscription } from '../../../hooks/usePolkadotApi';
import { DepositFormFields } from '../../../types/restake';
import AssetList from '../AssetList';
import ChainList from '../ChainList';
import ModalContent from '../ModalContent';
import RestakeTabs from '../RestakeTabs';
import ActionButton from './ActionButton';
import DestChainInput from './DestChainInput';
import SourceChainInput from './SourceChainInput';
import TxDetails from './TxDetails';

function getDefaultTypedChainId(activeTypedChainId: number | null) {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
}

export type DepositFormProps = ComponentProps<'form'>;

const DepositForm = ({ className, ...props }: DepositFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const activeTypedChainId = useActiveTypedChainId();

  const {
    register,
    setValue: setFormValue,
    resetField,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
    defaultValues: {
      sourceTypedChainId: getDefaultTypedChainId(activeTypedChainId),
    },
  });

  const { assetMap, assetWithBalances } = useRestakeContext();
  const { deposit } = useRestakeTx();

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

  // Register fields render on modal on mount
  useEffect(() => {
    register('depositAssetId', { required: 'Asset is required' });
    register('sourceTypedChainId', { required: 'Chain is required' });
  }, [register]);

  useEffect(() => {
    setValue('sourceTypedChainId', getDefaultTypedChainId(activeTypedChainId));
  }, [activeTypedChainId, setValue]);

  const sourceTypedChainId = watch('sourceTypedChainId');

  // Subscribe to sourceTypedChainId and update customRpc
  useRpcSubscription(sourceTypedChainId);

  // Modal states
  const [chainModalOpen, setChainModalOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  // Chain modal handlers
  const openChainModal = useCallback(() => setChainModalOpen(true), []);
  const closeChainModal = useCallback(() => setChainModalOpen(false), []);

  // Token modal handlers
  const openTokenModal = useCallback(() => setTokenModalOpen(true), []);
  const closeTokenModal = useCallback(() => setTokenModalOpen(false), []);

  const selectableTokens = useMemo(
    () =>
      assetWithBalances.map((asset) => {
        const balance = asset.balance;

        return {
          id: asset.assetId,
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          ...(balance !== null
            ? {
                assetBalanceProps: {
                  balance: +formatUnits(
                    balance.balance,
                    asset.metadata.decimals,
                  ),
                },
              }
            : {}),
        } satisfies TokenListCardProps['selectTokens'][number];
      }),
    [assetWithBalances],
  );

  const options = useMemo<Props<DepositContext>>(() => {
    return {
      options: {
        [TxEvent.SUCCESS]: {
          secondaryMessage: ({ amount, assetId }, explorerUrl) => {
            return (
              <ViewTxOnExplorer url={explorerUrl}>
                {assetMap[assetId]
                  ? `Successfully deposit ${formatUnits(amount, assetMap[assetId].decimals)} ${assetMap[assetId].symbol}`.trim()
                  : undefined}
              </ViewTxOnExplorer>
            );
          },
        },
      },
      onTxSuccess: () => resetField('amount'),
    };
  }, [assetMap, resetField]);

  const txEventHandlers = useRestakeTxEventHandlersWithNoti(options);

  const handleChainChange = useCallback(
    ({ typedChainId }: ChainType) => {
      setValue('sourceTypedChainId', typedChainId);
      setChainModalOpen(false);
    },
    [setValue],
  );

  const handleTokenChange = useCallback(
    (token: TokenListCardProps['selectTokens'][number]) => {
      setValue('depositAssetId', token.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
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
      {...props}
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className={twMerge('overflow-hidden', className)}
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

      <Modal open={chainModalOpen} onOpenChange={setChainModalOpen}>
        <ModalContent
          isOpen={chainModalOpen}
          title="Select Chain"
          description="Select the chain you want to deposit from."
          onInteractOutside={closeChainModal}
        >
          <ChainList
            selectedTypedChainId={watch('sourceTypedChainId')}
            onClose={closeChainModal}
            onChange={handleChainChange}
          />
        </ModalContent>
      </Modal>

      <Modal open={tokenModalOpen} onOpenChange={setTokenModalOpen}>
        <ModalContent
          isOpen={tokenModalOpen}
          title="Select Asset"
          description="Select the asset you want to deposit."
          onInteractOutside={closeTokenModal}
        >
          <AssetList
            selectTokens={selectableTokens}
            onChange={handleTokenChange}
            onClose={closeTokenModal}
          />
        </ModalContent>
      </Modal>
    </form>
  );
};

export default DepositForm;
