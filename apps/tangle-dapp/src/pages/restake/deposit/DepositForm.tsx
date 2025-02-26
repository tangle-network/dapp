import { BN } from '@polkadot/util';
import { PresetTypedChainId } from '@tangle-network/dapp-types';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { TokenIcon } from '@tangle-network/icons';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import {
  AmountFormatStyle,
  Card,
  formatDisplayAmount,
  isEvmAddress,
  shortenHex,
} from '@tangle-network/ui-components';
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
import LogoListItem from '../../../components/Lists/LogoListItem';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useRestakeApi from '../../../data/restake/useRestakeApi';
import useRestakeAsset from '../../../data/restake/useRestakeAsset';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import useQueryState from '../../../hooks/useQueryState';
import { QueryParamKey } from '../../../types';
import { DepositFormFields } from '../../../types/restake';
import filterBy from '../../../utils/filterBy';
import parseChainUnits from '../../../utils/parseChainUnits';
import Form from '../Form';
import RestakeTabs from '../RestakeTabs';
import ActionButton from './ActionButton';
import Details from './Details';
import SourceChainInput from './SourceChainInput';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';

const getDefaultTypedChainId = (
  activeTypedChainId: number | null,
): number | PresetTypedChainId.TangleTestnetNative => {
  return isDefined(activeTypedChainId) &&
    SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(activeTypedChainId)
    ? activeTypedChainId
    : SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS[0];
};

type Props = ComponentProps<'form'>;

const DepositForm: FC<Props> = (props) => {
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

  const depositAssetId = watch('depositAssetId');

  const [vaultIdParam, setVaultIdParam] = useQueryState(
    QueryParamKey.RESTAKE_VAULT,
  );

  const assets = useRestakeAssets();
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
    if (!vaultIdParam || assets === null) {
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
    setValue('depositAssetId', defaultAsset.assetId);
    setValue('amount', defaultAsset.balance.toString());

    // Remove the param to prevent reuse after initial load.
    setVaultIdParam(null);
  }, [assets, setValue, setVaultIdParam, vaultIdParam]);

  const {
    status: tokenModalOpen,
    close: closeTokenModal,
    open: openTokenModal,
    update: updateTokenModal,
  } = useModal();

  const allAssets = useMemo<RestakeAsset[]>(() => {
    if (assets === null) {
      return [];
    }

    const nativeAssetsWithBalances = Array.from(assets.values())
      .filter((asset) => asset.balance !== undefined && !asset.balance.isZero())
      .map((asset) => {
        assert(asset.balance !== undefined);

        return {
          id: asset.assetId,
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          balance: asset.balance,
          decimals: asset.metadata.decimals,
        } satisfies RestakeAsset;
      });

    return nativeAssetsWithBalances;
  }, [assets]);

  const handleAssetSelection = useCallback(
    (asset: RestakeAsset) => {
      setValue('depositAssetId', asset.id);
      closeTokenModal();
    },
    [closeTokenModal, setValue],
  );

  const asset = useRestakeAsset(depositAssetId);
  const isReady = restakeApi !== null && asset !== null && !isSubmitting;

  const onSubmit = useCallback<SubmitHandler<DepositFormFields>>(
    async ({ amount }) => {
      if (!isReady) {
        return;
      }

      const amountBn = parseChainUnits(amount, asset.decimals);

      if (!(amountBn instanceof BN)) {
        return;
      }

      await restakeApi.deposit(asset.id, amountBn);
      setValue('amount', '', { shouldValidate: false });
      setValue('depositAssetId', '', { shouldValidate: false });

      // Reload balances after depositing an EVM ERC-20 asset,
      // so that the deposit amount is reflected in the balance.
      if (isEvmAddress(asset.id)) {
        refetchErc20Balances();
      }
    },
    [asset?.decimals, asset?.id, isReady, restakeApi, setValue],
  );

  return (
    <StyleContainer className="md:min-w-[512px]">
      <RestakeTabs />

      <Card withShadow tightPadding>
        <Form {...props} ref={formRef} onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col h-full space-y-4 grow">
            <div className="space-y-2">
              <SourceChainInput
                amountError={errors.amount?.message}
                openTokenModal={openTokenModal}
                register={register}
                setValue={setValue}
                watch={watch}
              />
            </div>

            <div className="flex flex-col justify-between gap-4 grow">
              <Details watch={watch} />

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
              filterBy(query, [asset.id, asset.name, asset.symbol])
            }
            searchInputId="restake-deposit-assets-search"
            searchPlaceholder="Search assets..."
            titleWhenEmpty="No Assets Found"
            descriptionWhenEmpty="It seems that there are no available assets on this account in this network yet. Please try again later."
            items={allAssets}
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
                  rightBottomText="Balance"
                  rightUpperText={`${fmtBalance} ${asset.symbol}`}
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
