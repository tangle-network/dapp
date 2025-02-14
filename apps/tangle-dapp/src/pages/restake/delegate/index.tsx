import { ChainConfig } from '@tangle-network/dapp-config';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { useRestakeContext } from '@tangle-network/tangle-shared-ui/context/RestakeContext';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { useRpcSubscription } from '@tangle-network/tangle-shared-ui/hooks/usePolkadotApi';
import {
  AmountFormatStyle,
  assertSubstrateAddress,
  Card,
  formatDisplayAmount,
  isEvmAddress,
  isSubstrateAddress,
  shortenHex,
} from '@tangle-network/ui-components';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import keys from 'lodash/keys';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import LogoListItem from '../../../components/Lists/LogoListItem';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import useIdentities from '../../../data/useIdentities';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import type { DelegationFormFields } from '../../../types/restake';
import filterBy from '../../../utils/filterBy';
import Form from '../Form';
import RestakeTabs from '../RestakeTabs';
import StyleContainer from '../../../components/restaking/StyleContainer';
import SupportedChainModal from '../SupportedChainModal';
import useSwitchChain from '../useSwitchChain';
import ActionButton from './ActionButton';
import Details from './Details';
import RestakeDelegateInput from './RestakeDelegateInput';
import parseChainUnits from '../../../utils/parseChainUnits';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import useRestakeAsset from '../../../data/restake/useRestakeAsset';

type RestakeOperator = {
  accountId: SubstrateAddress;
  identityName?: string;
  isActive: boolean;
};

const RestakeDelegateForm: FC = () => {
  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
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

  const { assets } = useRestakeContext();
  const restakeApi = useRestakeApi();
  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();

  const { result: operatorIdentities } = useIdentities(
    useMemo(() => Object.keys(operatorMap), [operatorMap]),
  );

  const switchChain = useSwitchChain();
  const activeTypedChainId = useActiveTypedChainId();

  useRpcSubscription(activeTypedChainId);

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

  // Set the default asset ID to the first deposited asset.
  useEffect(() => {
    if (defaultAssetId !== null) {
      setValue('assetId', defaultAssetId);
    }
  }, [defaultAssetId, setValue]);

  // Set the operatorAccountId from the URL param.
  useEffect(() => {
    if (
      !operatorParam ||
      typeof operatorParam !== 'string' ||
      !isSubstrateAddress(operatorParam) ||
      !operatorMap[operatorParam]
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

  const depositedAssets = useMemo<RestakeAsset[]>(() => {
    if (!isDefined(delegatorInfo)) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits).flatMap(
      ([assetIdString, { amount, delegatedAmount }]) => {
        const assetId = assertRestakeAssetId(assetIdString);
        const balance = new BN((amount - delegatedAmount).toString());
        const metadata = assets[assetId];

        if (metadata === undefined) {
          return [];
        }

        return {
          id: metadata.assetId,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          balance,
        } satisfies RestakeAsset;
      },
    );
  }, [assets, delegatorInfo]);

  const handleAssetSelect = useCallback(
    (asset: RestakeAsset) => {
      setValue('assetId', asset.id);
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

  const selectedAsset = useRestakeAsset(watch('assetId'));

  const isReady =
    restakeApi !== null && !isSubmitting && selectedAsset !== null;

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>(
    async ({ amount, assetId, operatorAccountId }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, selectedAsset.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      await restakeApi.delegate(operatorAccountId, assetId, amountBn);

      setValue('operatorAccountId', '', { shouldValidate: false });
      setValue('amount', '', { shouldValidate: false });
      setValue('assetId', '', { shouldValidate: false });
    },
    [isReady, restakeApi, selectedAsset?.decimals, setValue],
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
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeTabs />

      <Card withShadow tightPadding>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full space-y-4 grow">
            <RestakeDelegateInput
              amountError={errors.amount?.message}
              delegatorInfo={delegatorInfo}
              openAssetModal={openAssetModal}
              openOperatorModal={openOperatorModal}
              register={register}
              setValue={setValue}
              watch={watch}
            />

            <div className="flex flex-col justify-between gap-4 grow">
              <Details />

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
            setIsOpen={updateAssetModal}
            titleWhenEmpty="No Assets Available"
            descriptionWhenEmpty="Have you made a deposit on this network yet?"
            items={depositedAssets}
            searchInputId="restake-delegate-asset-search"
            searchPlaceholder="Search for asset or enter token address"
            getItemKey={(item) => item.id}
            onSelect={handleAssetSelect}
            filterItem={(item, query) =>
              filterBy(query, [item.name, item.symbol, item.id])
            }
            renderItem={(asset) => {
              const fmtBalance = formatDisplayAmount(
                asset.balance,
                asset.decimals,
                AmountFormatStyle.SHORT,
              );

              const idText = isEvmAddress(asset.id)
                ? `Address: ${shortenHex(asset.id)}`
                : `Asset ID: ${asset.id}`;

              return (
                <LogoListItem
                  logo={<TokenIcon size="xl" name={asset.symbol} />}
                  leftUpperContent={
                    asset.name !== undefined
                      ? `${asset.name} (${asset.symbol})`
                      : asset.symbol
                  }
                  leftBottomContent={idText}
                  rightUpperText={`${fmtBalance} ${asset.symbol}`}
                  rightBottomText="Balance"
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
            searchPlaceholder="Search for an operator..."
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
