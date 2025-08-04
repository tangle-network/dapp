import { BN } from '@polkadot/util';
import {
  ChainConfig,
  TANGLE_TOKEN_DECIMALS,
} from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import {
  RestakeAsset,
  RestakeAssetTableItem,
} from '@tangle-network/tangle-shared-ui/types/restake';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import {
  assertSubstrateAddress,
  Card,
  isSubstrateAddress,
} from '@tangle-network/ui-components';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import keys from 'lodash/keys';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AssetListItem from '../../../components/Lists/AssetListItem';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import useNativeRestakeAssetBalance from '../../../data/restake/useNativeRestakeAssetBalance';
import useNativeRestakeTx from '../../../data/restake/useNativeRestakeTx';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { DelegationFormFields } from '../../../types/restake';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import parseChainUnits from '../../../utils/parseChainUnits';
import Form from '../Form';
import RestakeActionTabs from '../RestakeActionTabs';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import Details from './Details';
import RestakeDelegateInput from './RestakeDelegateInput';
import BlueprintSelection from '../../../components/restaking/BlueprintSelection';
import useBlueprintStore from '../../../context/useBlueprintStore';

type RestakeOperator = {
  accountId: SubstrateAddress;
  identityName?: string;
  isActive: boolean;
};

type Props = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
};

const RestakeDelegateForm: FC<Props> = ({ assets }) => {
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<DelegationFormFields>({
    mode: 'onBlur',
  });

  const selectedOperatorAddress = watch('operatorAccountId');

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

  // Register select fields on mount.
  useEffect(() => {
    register('assetId', { required: 'Asset is required' });
    register('operatorAccountId', { required: 'Operator is required' });
  }, [register]);

  const restakeApi = useRestakeApi();
  const { result: delegatorInfo } = useRestakeDelegatorInfo();
  const { result: operatorMap } = useRestakeOperatorMap();
  const blueprintSelection = useBlueprintStore((store) => store.selection);

  const addressesToFetch = useMemo(() => {
    const keys = Array.from(operatorMap.keys());
    if (keys.length === 0) {
      return [];
    }
    return keys.map((address) => assertSubstrateAddress(address));
  }, [operatorMap]);

  const { result: operatorIdentities } = useIdentities(addressesToFetch);

  const switchChain = useSwitchChain();

  // Set the default assetId to the first assetId in the depositedAssets.
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

  // Set the operatorAccountId from the URL param.
  useEffect(() => {
    if (
      !operatorParam ||
      typeof operatorParam !== 'string' ||
      !isSubstrateAddress(operatorParam) ||
      !operatorMap.get(operatorParam)
    ) {
      return;
    }

    setFormValue('operatorAccountId', operatorParam);

    // Remove the param to prevent reuse after initial load.
    setOperatorParam(null);
  }, [operatorMap, operatorParam, setFormValue, setOperatorParam]);

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal(false);

  const {
    status: isAssetModalOpen,
    open: openAssetModal,
    close: closeAssetModal,
    update: updateAssetModal,
  } = useModal(false);

  const {
    status: isOperatorModalOpen,
    open: openOperatorModal,
    close: closeOperatorModal,
    update: updateOperatorModal,
  } = useModal(false);

  const { nativeTokenSymbol } = useNetworkStore();
  const nativeRestakeAssetBalance = useNativeRestakeAssetBalance();
  const { status: nativeRestakeTxStatus, execute: executeNativeRestake } =
    useNativeRestakeTx();

  const [selectedAssetItem, setSelectedAssetItem] =
    useState<RestakeAssetTableItem | null>(null);

  const depositedAssets = useMemo<RestakeAssetTableItem[]>(() => {
    const result: RestakeAssetTableItem[] = [];

    // Insert the native token's staked balance as available as well.
    // This is to be used for native restaking.
    if (
      nativeRestakeAssetBalance !== null &&
      !nativeRestakeAssetBalance.isZero()
    ) {
      result.push({
        id: NATIVE_ASSET_ID,
        name: 'Tangle Network Token',
        symbol: nativeTokenSymbol,
        decimals: TANGLE_TOKEN_DECIMALS,
        balance: nativeRestakeAssetBalance,
        label: 'Nominated',
        labelColor: 'purple' as const,
      } satisfies RestakeAssetTableItem);
    }

    if (delegatorInfo === null) {
      return result;
    }

    const deposits = Object.entries(delegatorInfo.deposits).flatMap(
      ([assetIdString, { amount, delegatedAmount }]) => {
        const assetId = assertRestakeAssetId(assetIdString);
        const balance = new BN((amount - delegatedAmount).toString());
        const asset = assets?.get(assetId);

        if (asset === undefined) {
          return [];
        }

        const isNativeAsset = assetId === NATIVE_ASSET_ID;
        const displayName = isNativeAsset
          ? 'Tangle Network Token'
          : asset.metadata.name;

        return {
          id: asset.id,
          name: displayName,
          symbol: asset.metadata.symbol,
          decimals: asset.metadata.decimals,
          label: isNativeAsset ? 'Deposited' : undefined,
          labelColor: isNativeAsset ? ('green' as const) : undefined,
          balance,
        } satisfies RestakeAssetTableItem;
      },
    );

    return result.concat(deposits);
  }, [assets, delegatorInfo, nativeRestakeAssetBalance, nativeTokenSymbol]);

  useEffect(() => {
    if (defaultAssetId !== null && depositedAssets.length > 0) {
      setValue('assetId', defaultAssetId);
      const firstAsset = depositedAssets.find(
        (asset) => asset.id === defaultAssetId,
      );
      if (firstAsset) {
        setSelectedAssetItem(firstAsset);
      }
    }
  }, [defaultAssetId, setValue, depositedAssets]);

  const handleAssetSelect = useCallback(
    (asset: RestakeAssetTableItem) => {
      setValue('assetId', asset.id);
      setSelectedAssetItem(asset);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

  const handleChainChange = useCallback(
    async (chain: ChainConfig) => {
      const typedChainId = calculateTypedChainId(chain.chainType, chain.id);

      await switchChain(typedChainId);
      closeChainModal();
    },
    [closeChainModal, switchChain],
  );

  const selectedAssetId = watch('assetId');
  const selectedAsset = useMemo(() => {
    if (selectedAssetItem) {
      const asset = {
        id: selectedAssetItem.id,
        metadata: {
          assetId: selectedAssetItem.id,
          name: selectedAssetItem.name || selectedAssetItem.symbol,
          symbol: selectedAssetItem.symbol,
          decimals: selectedAssetItem.decimals,
          isFrozen: false,
          vaultId: null,
          priceInUsd: null,
          status: 'Live' as const,
        },
        balance: selectedAssetItem.balance,
      };
      return asset;
    }

    return assets?.get(selectedAssetId) ?? null;
  }, [assets, selectedAssetId, selectedAssetItem]);

  const isReady =
    restakeApi !== null &&
    !isSubmitting &&
    selectedAsset !== null &&
    executeNativeRestake !== null &&
    nativeRestakeTxStatus !== TxStatus.PROCESSING;

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>(
    async ({ amount, assetId, operatorAccountId }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, selectedAsset.metadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      const isNominatedAsset = selectedAssetItem?.label === 'Nominated';

      if (assetId === NATIVE_ASSET_ID && isNominatedAsset) {
        await executeNativeRestake({
          amount: amountBn,
          operatorAddress: operatorAccountId,
          blueprintSelection: blueprintSelection.map(
            (id) => new BN(id.toString()),
          ),
        });
      } else {
        if (!restakeApi) return;
        await restakeApi.delegate(
          operatorAccountId,
          assetId,
          amountBn,
          blueprintSelection?.map((id) => new BN(id.toString())),
          isNominatedAsset,
        );
      }

      setValue('operatorAccountId', '', { shouldValidate: false });
      setValue('amount', '', { shouldValidate: false });
      setValue('assetId', '', { shouldValidate: false });
      setSelectedAssetItem(null);
    },
    [
      blueprintSelection,
      executeNativeRestake,
      isReady,
      restakeApi,
      selectedAsset,
      selectedAssetItem,
      setValue,
    ],
  );

  const operators = useMemo<RestakeOperator[]>(() => {
    const result = Array.from(operatorMap.entries())
      .filter(([, metadata]) => metadata.status === 'Active')
      .map(([accountId]) => {
        const substrateAddress = assertSubstrateAddress(accountId);
        const identity = operatorIdentities.get(substrateAddress);
        return {
          accountId: substrateAddress,
          identityName: identity?.name ?? undefined,
          isActive: true,
        };
      });

    return result;
  }, [operatorMap, operatorIdentities]);

  const handleOnSelectOperator = useCallback(
    (operator: RestakeOperator) => {
      setValue('operatorAccountId', operator.accountId);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeActionTabs />

      <Card withShadow tightPadding>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full gap-4 grow">
            <div className="flex flex-col gap-2">
              <RestakeDelegateInput
                amountError={errors.amount?.message}
                delegatorInfo={delegatorInfo}
                openAssetModal={openAssetModal}
                openOperatorModal={openOperatorModal}
                register={register}
                setValue={setValue}
                watch={watch}
                assets={assets}
                selectedAsset={selectedAsset}
                operatorIdentities={operatorIdentities}
              />

              <BlueprintSelection operatorAddress={selectedOperatorAddress} />
            </div>

            <div className="flex flex-col justify-between gap-4 grow">
              <Details />

              <ActionButton
                errors={errors}
                isValid={isValid && isReady}
                openChainModal={openChainModal}
                watch={watch}
                isSubmitting={
                  isSubmitting || nativeRestakeTxStatus === TxStatus.PROCESSING
                }
              />
            </div>
          </div>

          <ListModal
            title="Select Asset"
            isOpen={isAssetModalOpen}
            setIsOpen={updateAssetModal}
            titleWhenEmpty="No Assets Available"
            descriptionWhenEmpty="Have you made a deposit on this network yet?"
            items={depositedAssets}
            searchInputId="restake-delegate-asset-search"
            searchPlaceholder="Search assets..."
            getItemKey={(item) => item.id}
            onSelect={handleAssetSelect}
            filterItem={(item, query) =>
              filterBy(query, [item.name, item.symbol, item.id])
            }
            renderItem={(asset) => {
              return (
                <AssetListItem
                  assetId={asset.id}
                  name={asset.name}
                  symbol={asset.symbol}
                  balance={asset.balance}
                  decimals={asset.decimals}
                  rightBottomText="Balance"
                  label={asset.label}
                  labelColor={asset.labelColor}
                />
              );
            }}
          />

          <ListModal
            title="Select Operator"
            isOpen={isOperatorModalOpen}
            setIsOpen={updateOperatorModal}
            titleWhenEmpty="No Operators Available"
            descriptionWhenEmpty="Looks like there aren't any registered operators in this network yet. Make the leap and become the first operator!"
            items={operators}
            searchInputId="restake-delegate-operator-search"
            searchPlaceholder="Search operators..."
            getItemKey={(item) => item.accountId}
            onSelect={handleOnSelectOperator}
            filterItem={(item, query) =>
              filterBy(query, [item.accountId, item.identityName])
            }
            renderItem={({ accountId, identityName }) => (
              <OperatorListItem
                accountAddress={accountId}
                identity={identityName}
              />
            )}
          />

          <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
            <SupportedChainModal
              onClose={closeChainModal}
              onChainChange={handleChainChange}
            />
          </Modal>
        </Form>
      </Card>
    </StyleContainer>
  );
};

export default RestakeDelegateForm;
