'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ChainConfig } from '@webb-tools/dapp-config';
import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { ArrowRight } from '@webb-tools/icons/ArrowRight';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { type TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import { useQueryState } from 'nuqs';
import {
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';

import useRestakeTxEventHandlersWithNoti, {
  type Props,
} from '../../..//data/restake/useRestakeTxEventHandlersWithNoti';
import AvatarWithText from '../../../components/AvatarWithText';
import { ChainList } from '../../../components/Lists/ChainList';
import {
  OperatorConfig,
  OperatorList,
} from '../../../components/Lists/OperatorList';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import { useRestakeContext } from '../../../context/RestakeContext';
import {
  type DepositContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeOperatorMap from '../../../data/restake/useRestakeOperatorMap';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import ViewTxOnExplorer from '../../../data/restake/ViewTxOnExplorer';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { useRpcSubscription } from '../../../hooks/usePolkadotApi';
import { QueryParamKey } from '../../../types';
import { DepositFormFields } from '../../../types/restake';
import AssetList from '../AssetList';
import Form from '../Form';
import ModalContent from '../ModalContent';
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

const DepositForm = ({ ...props }: DepositFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const { apiConfig } = useWebContext();

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

  const [vaultIdParam, setVaultIdParam] = useQueryState(
    QueryParamKey.RESTAKE_VAULT,
  );

  const { assetMap, assetWithBalances } = useRestakeContext();
  const { operatorMap } = useRestakeOperatorMap();
  const { result: operatorIdentities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );
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
    register('operatorAccountId');
  }, [register]);

  useEffect(() => {
    setValue('sourceTypedChainId', getDefaultTypedChainId(activeTypedChainId));
  }, [activeTypedChainId, setValue]);

  // Reset form when active chain changes
  useEffect(() => {
    resetField('amount');
  }, [activeTypedChainId, resetField]);

  useEffect(() => {
    if (!vaultIdParam) return;

    const defaultAsset = assetWithBalances
      .filter((asset) => asset.metadata.vaultId === vaultIdParam)
      .sort((a, b) => {
        const aBalance = a.balance?.balance ?? ZERO_BIG_INT;
        const bBalance = b.balance?.balance ?? ZERO_BIG_INT;

        if (aBalance === bBalance) return 0;

        return aBalance > bBalance ? -1 : 1;
      })
      // Find the first asset with balance
      .find(
        (asset) =>
          asset.balance?.balance && asset.balance.balance > ZERO_BIG_INT,
      );

    if (!defaultAsset?.balance?.balance) return;

    // Select the first asset in the vault by default
    setValue('depositAssetId', defaultAsset.assetId);
    setValue(
      'amount',
      formatUnits(defaultAsset.balance.balance, defaultAsset.metadata.decimals),
    );

    // Remove the param to prevent reuse after initial load
    setVaultIdParam(null);
  }, [assetWithBalances, vaultIdParam, setVaultIdParam, setValue]);

  const sourceTypedChainId = watch('sourceTypedChainId');

  // Subscribe to sourceTypedChainId and update customRpc
  useRpcSubscription(sourceTypedChainId);

  // Modal states
  const {
    status: chainModalOpen,
    close: closeChainModal,
    open: openChainModal,
  } = useModal();

  const {
    status: operatorModalOpen,
    close: closeOperatorModal,
    open: openOperatorModal,
  } = useModal();

  const {
    status: tokenModalOpen,
    close: closeTokenModal,
    open: openTokenModal,
  } = useModal();

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
                  ...(asset.metadata.vaultId
                    ? {
                        subContent: `Vault ID: ${asset.metadata.vaultId}`,
                      }
                    : {}),
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
          secondaryMessage: (
            { amount, assetId, operatorAccount },
            explorerUrl,
          ) => {
            if (!operatorAccount)
              return (
                <ViewTxOnExplorer url={explorerUrl}>
                  {assetMap[assetId] &&
                    `Successfully deposit ${formatUnits(amount, assetMap[assetId].decimals)} ${assetMap[assetId].symbol}`.trim()}
                </ViewTxOnExplorer>
              );

            return (
              <ViewTxOnExplorer url={explorerUrl}>
                Successfully deposited and delegated{' '}
                {formatUnits(amount, assetMap[assetId].decimals)}{' '}
                {assetMap[assetId].symbol} to{' '}
                <AvatarWithText
                  className="inline-flex"
                  accountAddress={operatorAccount}
                  identityName={operatorIdentities?.[operatorAccount]?.name}
                  overrideAvatarProps={{ size: 'sm' }}
                />
              </ViewTxOnExplorer>
            );
          },
        },
      },
      onTxSuccess: () => resetField('amount'),
    };
  }, [assetMap, operatorIdentities, resetField]);

  const txEventHandlers = useRestakeTxEventHandlersWithNoti(options);

  const handleTokenChange = useCallback(
    (token: TokenListCardProps['selectTokens'][number]) => {
      setValue('depositAssetId', token.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const operators = useMemo(() => {
    return Object.entries(operatorMap).map(([accountId, _operator]) => ({
      accountId,
      name: operatorIdentities?.[accountId]?.name || '<Unknown>',
      status: 'active',
    }));
  }, [operatorMap, operatorIdentities]);

  const handleOnSelectOperator = useCallback(
    (operator: OperatorConfig) => {
      setValue('operatorAccountId', operator.accountId);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async (data) => {
      const { amount, depositAssetId, operatorAccountId } = data;
      if (depositAssetId === null || assetMap[depositAssetId] === undefined) {
        return;
      }

      const asset = assetMap[depositAssetId];

      await deposit(
        depositAssetId,
        parseUnits(amount, asset.decimals),
        operatorAccountId,
        txEventHandlers,
      );
    },
    [assetMap, deposit, txEventHandlers],
  );

  const sourceChainOptions = useMemo(() => {
    return SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.map(
      (typedChainId) => [typedChainId, apiConfig.chains[typedChainId]] as const,
    )
      .filter(([, chain]) => Boolean(chain))
      .map(([typedChainId, chain]) => ({
        ...chain,
        typedChainId,
      }));
  }, [apiConfig.chains]);

  const handleOnSelectChain = useCallback(
    (chain: ChainConfig) => {
      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);
      setValue('sourceTypedChainId', typedChainId);
      closeChainModal();
    },
    [closeChainModal, setValue],
  );

  return (
    <Form {...props} ref={formRef} onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col h-full space-y-4 grow">
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

          <DestChainInput
            openOperatorModal={openOperatorModal}
            watch={watch}
            operatorIdentities={operatorIdentities}
          />
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

      <Modal>
        <ModalContent
          isOpen={chainModalOpen}
          title="Select Chain"
          description="Select the chain you want to deposit from."
          onInteractOutside={closeChainModal}
        >
          <ChainList
            onClose={closeChainModal}
            chains={sourceChainOptions}
            onSelectChain={handleOnSelectChain}
            chainType="source"
          />
        </ModalContent>

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

        <ModalContent
          isOpen={operatorModalOpen}
          title="Select Operator"
          description="Select the operator you want to delegate to"
          onInteractOutside={closeOperatorModal}
        >
          <OperatorList
            onClose={closeOperatorModal}
            operatorMap={operatorMap}
            operatorIdentities={operatorIdentities}
            onSelectOperator={handleOnSelectOperator}
            operators={operators}
          />
        </ModalContent>
      </Modal>
    </Form>
  );
};

export default DepositForm;
