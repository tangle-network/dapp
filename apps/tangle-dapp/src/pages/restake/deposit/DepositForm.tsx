import { BN, BN_ZERO } from '@polkadot/util';
import assert from 'assert';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Card } from '@tangle-network/ui-components';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { isEvmAddress } from '@tangle-network/ui-components';
import { FC, useCallback, useMemo, useEffect, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import AssetListItem from '../../../components/Lists/AssetListItem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import useRestakeDepositTx from '../../../data/restake/useRestakeDepositTx';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import { DepositFormFields } from '../../../types/restake';
import parseChainUnits from '../../../utils/parseChainUnits';

import Form from '../Form';
import RestakeActionTabs from '../RestakeActionTabs';
import ActionButton from './ActionButton';
import SourceChainInput from './SourceChainInput';
import Details from './Details';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useSubstrateTx';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';

const getDefaultTypedChainId = (
  activeTypedChainId: number | null,
): number | PresetTypedChainId.TangleTestnetNative => {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
};

type Props = {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  isLoadingAssets: boolean;
  refetchErc20Balances: () => void;
};

const DepositForm: FC<Props> = ({
  assets,
  isLoadingAssets,
  refetchErc20Balances,
}) => {
  const activeTypedChainId = useActiveTypedChainId();
  const { status: depositTxStatus, execute: executeDepositTx } =
    useRestakeDepositTx();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    setValue: setFormValue,
    resetField,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<DepositFormFields>({
    mode: 'onBlur',
    defaultValues: {
      sourceTypedChainId: getDefaultTypedChainId(activeTypedChainId),
    },
  });

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

  // Reset form when active chain changes.
  useEffect(() => {
    resetField('amount');
  }, [activeTypedChainId, resetField]);

  useEffect(() => {
    if (assets === null || isLoadingAssets) {
      return;
    }

    const defaultAsset = Array.from(assets.values()).find(
      ({ balance }) => balance !== undefined && !balance.isZero(),
    );

    if (defaultAsset === undefined) {
      return;
    }

    assert(defaultAsset.balance !== undefined);

    setValue('depositAssetId', defaultAsset.id);
  }, [assets, setValue, isLoadingAssets]);

  const {
    status: tokenModalOpen,
    close: closeTokenModal,
    open: openTokenModal,
    update: updateTokenModal,
  } = useModal();

  const allAssets = useMemo(() => {
    if (assets === null) {
      return [];
    }

    return Array.from(assets.values()).sort((a, b) => {
      const aBalance = a.balance ?? BN_ZERO;
      const bBalance = b.balance ?? BN_ZERO;
      return aBalance.isZero()
        ? 1
        : bBalance.isZero()
          ? -1
          : bBalance.cmp(aBalance);
    });
  }, [assets]);

  const assetId = watch('depositAssetId');

  const asset = useMemo(() => {
    if (assets === null || assetId === null) {
      return null;
    }

    const candidates = Array.from(assets.values()).filter(
      (restakeAsset) => restakeAsset.id === assetId,
    );

    return candidates.length === 0 ? null : candidates[0];
  }, [assetId, assets]);

  const handleAssetSelection = useCallback(
    (asset: RestakeAsset) => {
      setValue('depositAssetId', asset.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const isReady =
    executeDepositTx !== null &&
    asset !== null &&
    !isSubmitting &&
    depositTxStatus !== TxStatus.PROCESSING;

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async ({ amount }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, asset.metadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      if (!executeDepositTx) return;

      await executeDepositTx({
        assetId: asset.id,
        amount: amountBn,
      });

      setValue('amount', '', { shouldValidate: false });
      setValue('depositAssetId', '', { shouldValidate: false });

      if (isEvmAddress(asset.id)) {
        refetchErc20Balances();
      }
    },
    [
      asset?.metadata.decimals,
      asset?.id,
      isReady,
      refetchErc20Balances,
      executeDepositTx,
      setValue,
    ],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeActionTabs />

      <Card withShadow tightPadding>
        <Form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full space-y-4 grow">
            <div className="space-y-2">
              <SourceChainInput
                assets={assets}
                amountError={errors.amount?.message}
                openTokenModal={openTokenModal}
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </div>

            <div className="flex flex-col justify-between gap-4 grow">
              <Details />

              <ActionButton
                errors={errors}
                formRef={formRef}
                isSubmitting={isSubmitting}
                isTransactionLoading={depositTxStatus === TxStatus.PROCESSING}
                isValid={isValid}
                watch={watch}
              />
            </div>
          </div>
        </Form>
      </Card>

      <ListModal
        title="Select Asset"
        isOpen={tokenModalOpen}
        setIsOpen={updateTokenModal}
        onSelect={handleAssetSelection}
        filterItem={(asset, query) =>
          filterBy(query, [
            asset.id,
            asset.metadata.name,
            asset.metadata.symbol,
          ])
        }
        searchInputId="restake-deposit-assets-search"
        searchPlaceholder="Search assets..."
        titleWhenEmpty="No Assets Found"
        descriptionWhenEmpty="It seems that there are no available assets on this account in this network yet. Please try again later."
        items={allAssets}
        renderItem={(asset) => {
          const balance = asset.balance ?? BN_ZERO;
          const displayName =
            asset.id === '0' ? 'Tangle Network Token' : asset.metadata.name;

          return (
            <AssetListItem
              assetId={asset.id}
              name={displayName}
              symbol={asset.metadata.symbol}
              balance={balance}
              decimals={asset.metadata.decimals}
              rightBottomText="Balance"
            />
          );
        }}
      />
    </StyleContainer>
  );
};

export default DepositForm;
