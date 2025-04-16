import { BN, BN_ZERO } from '@polkadot/util';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { Card, formatBn, isEvmAddress } from '@tangle-network/ui-components';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import assert from 'assert';
import {
  type ComponentProps,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import AssetListItem from '../../../components/Lists/AssetListItem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import { DepositFormFields } from '../../../types/restake';
import filterBy from '../../../utils/filterBy';
import parseChainUnits from '../../../utils/parseChainUnits';
import Form from '../Form';
import RestakeActionTabs from '../RestakeActionTabs';
import ActionButton from './ActionButton';
import Details from './Details';
import SourceChainInput from './SourceChainInput';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';

const getDefaultTypedChainId = (
  activeTypedChainId: number | null,
): number | PresetTypedChainId.TangleTestnetNative => {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
};

type Props = ComponentProps<'form'> & {
  assets: Map<RestakeAssetId, RestakeAsset> | null;
  isLoadingAssets: boolean;
  refetchErc20Balances: () => void;
};

const DepositForm: FC<Props> = ({
  assets,
  isLoadingAssets,
  refetchErc20Balances,
  ...props
}) => {
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

  const [vaultIdParam, setVaultIdParam] = useQueryState(
    QueryParamKey.RESTAKE_VAULT,
  );

  const restakeApi = useRestakeApi();

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
    if (!vaultIdParam || assets === null || isLoadingAssets) {
      return;
    }

    // Find the first asset in the vault that has a balance.
    const defaultAsset = Array.from(assets.values()).find(
      ({ metadata, balance }) => {
        if (metadata.vaultId?.toString() !== vaultIdParam) {
          return false;
        }

        return balance !== undefined && !balance.isZero();
      },
    );

    if (defaultAsset === undefined) {
      setVaultIdParam(null);

      return;
    }

    assert(defaultAsset.balance !== undefined);

    // Select the first asset in the vault by default.
    setValue('depositAssetId', defaultAsset.id);

    setValue(
      'amount',
      formatBn(defaultAsset.balance, defaultAsset.metadata.decimals, {
        // Show the entire fraction part.
        fractionMaxLength: undefined,
      }),
    );

    // Remove the param to prevent reuse after initial load.
    setVaultIdParam(null);
  }, [assets, setValue, setVaultIdParam, vaultIdParam, isLoadingAssets]);

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

  const handleAssetSelection = useCallback(
    (asset: RestakeAsset) => {
      setValue('depositAssetId', asset.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const asset = useMemo(() => {
    return assets?.get(watch('depositAssetId')) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch('depositAssetId'), assets]);

  const isReady = restakeApi !== null && asset !== null && !isSubmitting;

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async ({ amount }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, asset.metadata.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      if (!restakeApi) return;
      await restakeApi.deposit(asset.id, amountBn);
      setValue('amount', '', { shouldValidate: false });
      setValue('depositAssetId', '', { shouldValidate: false });

      // Reload balances after depositing an EVM ERC-20 asset,
      // so that the deposit amount is reflected in the balance.
      if (isEvmAddress(asset.id)) {
        refetchErc20Balances();
      }
    },
    [
      asset?.metadata.decimals,
      asset?.id,
      isReady,
      refetchErc20Balances,
      restakeApi,
      setValue,
    ],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeActionTabs />

      <Card withShadow tightPadding>
        <Form {...props} ref={formRef} onSubmit={handleSubmit(onSubmit)}>
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
                isValid={isValid && isReady}
                watch={watch}
              />
            </div>
          </div>

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

              return (
                <AssetListItem
                  assetId={asset.id}
                  name={asset.metadata.name}
                  symbol={asset.metadata.symbol}
                  balance={balance}
                  decimals={asset.metadata.decimals}
                  rightBottomText="Balance"
                />
              );
            }}
          />
        </Form>
      </Card>
    </StyleContainer>
  );
};

export default DepositForm;
