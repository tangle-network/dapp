import { ChainConfig } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { useRestakeContext } from '@webb-tools/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@webb-tools/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@webb-tools/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { useRpcSubscription } from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import {
  assertSubstrateAddress,
  Card,
  isSubstrateAddress,
} from '@webb-tools/webb-ui-components';
import type { TokenListCardProps } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Modal } from '@webb-tools/webb-ui-components/components/Modal';
import { useModal } from '@webb-tools/webb-ui-components/hooks/useModal';
import entries from 'lodash/entries';
import keys from 'lodash/keys';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import AvatarWithText from '../../../components/AvatarWithText';
import {
  DelegatorStakeContext,
  TxEvent,
} from '../../../data/restake/RestakeTx/base';
import useRestakeTx from '../../../data/restake/useRestakeTx';
import useRestakeTxEventHandlersWithNoti, {
  type Props,
} from '../../../data/restake/useRestakeTxEventHandlersWithNoti';
import ViewTxOnExplorer from '../../../data/restake/ViewTxOnExplorer';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { DelegationFormFields } from '../../../types/restake';
import Form from '../Form';
import RestakeTabs from '../RestakeTabs';
import StyleContainer from '../StyleContainer';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import Info from './Info';
import StakeInput from './StakeInput';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';

type RestakeOperator = {
  accountId: SubstrateAddress;
  identityName?: string;
  isActive: boolean;
};

export default function RestakeStakePage() {
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

  const [operatorParam, setOperatorParam] = useQueryState(
    QueryParamKey.RESTAKE_OPERATOR,
  );

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
    if (
      !operatorParam ||
      typeof operatorParam !== 'string' ||
      !isSubstrateAddress(operatorParam)
    ) {
      return;
    }

    if (!operatorMap[operatorParam]) return;

    setFormValue('operatorAccountId', operatorParam);

    // Remove the param to prevent reuse after initial load
    setOperatorParam(null);
  }, [operatorMap, operatorParam, setFormValue, setOperatorParam]);

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
  } = useModal(false);

  const [isOperatorModalOpen, setIsOperatorModalOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

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
            ...(asset.vaultId
              ? {
                  subContent: `Vault ID: ${asset.vaultId}`,
                }
              : {}),
          },
        } satisfies TokenListCardProps['selectTokens'][number];
      });
  }, [assetMap, delegatorInfo]);

  const handleAssetChange = useCallback(
    (asset: TokenListCardProps['selectTokens'][number]) => {
      setValue('assetId', asset.id);
      setIsAssetModalOpen(false);
    },
    [setIsAssetModalOpen, setValue],
  );

  const handleChainChange = useCallback(
    async (chain: ChainConfig) => {
      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);
      await switchChain(typedChainId);
      closeChainModal();
    },
    [closeChainModal, switchChain],
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

  const operators = useMemo<RestakeOperator[]>(() => {
    return (
      Object.entries(operatorMap)
        // Include only active operators.
        .filter(([, metadata]) => metadata.status === 'Active')
        .map(([accountId]) => ({
          accountId: assertSubstrateAddress(accountId),
          identityName: operatorIdentities?.[accountId]?.name ?? undefined,
          isActive: true,
        }))
    );
  }, [operatorMap, operatorIdentities]);

  const handleOnSelectOperator = useCallback(
    (operator: RestakeOperator) => {
      setValue('operatorAccountId', operator.accountId);
      setIsOperatorModalOpen(false);
    },
    [setIsOperatorModalOpen, setValue],
  );

  return (
    <StyleContainer className="min-w-[512px]">
      <RestakeTabs />

      <Card withShadow tightPadding>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full space-y-4 grow">
            <StakeInput
              amountError={errors.amount?.message}
              delegatorInfo={delegatorInfo}
              openAssetModal={() => setIsAssetModalOpen(true)}
              openOperatorModal={() => setIsOperatorModalOpen(true)}
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

          <ListModal
            title="Select Asset"
            isOpen={isAssetModalOpen}
            setIsOpen={setIsAssetModalOpen}
            titleWhenEmpty="No Assets Available"
            descriptionWhenEmpty="Have you made a deposit on this network yet?"
            items={selectableTokens}
            searchInputId="restake-delegate-asset-search"
            searchPlaceholder="Search for asset or enter token address"
            getItemKey={(item) => item.id}
            renderItem={(i) => <div>{i.name}</div>}
            onSelect={handleAssetChange}
          />

          <ListModal
            title="Select Operator"
            isOpen={isOperatorModalOpen}
            setIsOpen={setIsOperatorModalOpen}
            titleWhenEmpty="No Operators Available"
            descriptionWhenEmpty="Looks like there aren't any registered operators in this network yet. Make the leap and become the first operator!"
            items={operators}
            searchInputId="restake-delegate-operator-search"
            searchPlaceholder="Search for an operator..."
            getItemKey={(item) => item.accountId}
            onSelect={handleOnSelectOperator}
            renderItem={({ accountId, identityName }) => (
              <OperatorListItem
                accountAddress={accountId}
                identity={identityName}
              />
            )}
          />

          <Modal>
            <SupportedChainModal
              isOpen={isChainModalOpen}
              onClose={closeChainModal}
              onChainChange={handleChainChange}
            />
          </Modal>
        </Form>
      </Card>
    </StyleContainer>
  );
}
