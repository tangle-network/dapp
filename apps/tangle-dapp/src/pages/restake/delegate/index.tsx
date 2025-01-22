import { ChainConfig } from '@webb-tools/dapp-config';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { TokenIcon } from '@webb-tools/icons';
import ListModal from '@webb-tools/tangle-shared-ui/components/ListModal';
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
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import addCommasToNumber from '@webb-tools/webb-ui-components/utils/addCommasToNumber';
import keys from 'lodash/keys';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { formatUnits } from 'viem';
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
import StakeInput from './StakeInput';
import parseChainUnits from '../../../utils/parseChainUnits';
import { BN } from '@polkadot/util';
import useRestakeApi from '../../../data/restake/useRestakeApi';

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

  const { assetMetadataMap } = useRestakeContext();
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

  const selectableTokens = useMemo(() => {
    if (!isDefined(delegatorInfo)) {
      return [];
    }

    return Object.entries(delegatorInfo.deposits)
      .filter(([assetId]) => Object.hasOwn(assetMetadataMap, assetId))
      .map(([assetId, { amount }]) => {
        const metadata = assetMetadataMap[assetId];

        return {
          id: metadata.id,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          assetBalanceProps: {
            balance: +formatUnits(amount, metadata.decimals),
            ...(metadata.vaultId
              ? {
                  subContent: `Vault ID: ${metadata.vaultId}`,
                }
              : {}),
          },
        };
      });
  }, [assetMetadataMap, delegatorInfo]);

  const handleAssetChange = useCallback(
    (asset: TokenListCardProps['selectTokens'][number]) => {
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

  const isReady = restakeApi !== null && !isSubmitting;

  const onSubmit = useCallback<SubmitHandler<DelegationFormFields>>(
    ({ amount, assetId, operatorAccountId }) => {
      if (!assetId || !isDefined(assetMetadataMap[assetId]) || !isReady) {
        return;
      }

      const assetMetadata = assetMetadataMap[assetId];
      const amountBn = parseChainUnits(amount, assetMetadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      return restakeApi.delegate(operatorAccountId, assetId, amountBn);
    },
    [assetMetadataMap, isReady, restakeApi],
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
    <StyleContainer className="min-w-[512px]">
      <RestakeTabs />

      <Card withShadow tightPadding>
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
            items={selectableTokens}
            searchInputId="restake-delegate-asset-search"
            searchPlaceholder="Search for asset or enter token address"
            getItemKey={(item) => item.id}
            onSelect={handleAssetChange}
            renderItem={(asset) => {
              const fmtBalance = `${addCommasToNumber(asset.assetBalanceProps.balance)} ${asset.symbol}`;

              return (
                <LogoListItem
                  logo={<TokenIcon size="xl" name={asset.symbol} />}
                  leftUpperContent={`${asset.name} (${asset.symbol})`}
                  leftBottomContent={`Asset ID: ${asset.id}`}
                  rightUpperText={fmtBalance}
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
