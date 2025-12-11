import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { Card } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import ActionButtonBase from '../../../components/restaking/ActionButtonBase';
import StyleContainer from '../../../components/restaking/StyleContainer';
import { SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/restake';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import SupportedChainModal from '../../restake/SupportedChainModal';
import useSwitchChain from '../../restake/useSwitchChain';
import LiquidStakingActionTabs from '../LiquidStakingActionTabs';
import {
  useCreateVault,
  useCreateAllBlueprintsVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useOperatorMap } from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { formatUnits } from 'viem';
import { Switcher } from '@tangle-network/ui-components/components/Switcher';

type CreateVaultFormFields = {
  operator: Address;
  asset: Address;
  useAllBlueprints: boolean;
};

type OperatorItem = {
  address: Address;
  stake: bigint;
  delegationCount: number;
};

const CreateVaultForm: FC = () => {
  const { address: userAddress } = useAccount();
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap();

  const { status: createStatus, execute: executeCreate } = useCreateVault();
  const { status: createAllStatus, execute: executeCreateAll } =
    useCreateAllBlueprintsVault();

  const [useAllBlueprints, setUseAllBlueprints] = useState(true);

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors: _errors, isSubmitting, isValid },
  } = useForm<CreateVaultFormFields>({
    mode: 'onChange',
    defaultValues: {
      useAllBlueprints: true,
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

  useEffect(() => {
    register('operator', { required: 'Operator is required' });
    register('asset', { required: 'Asset is required' });
  }, [register]);

  useEffect(() => {
    reset();
  }, [activeTypedChainId, reset]);

  const {
    status: operatorModalOpen,
    close: closeOperatorModal,
    open: openOperatorModal,
    update: updateOperatorModal,
  } = useModal();

  const {
    status: assetModalOpen,
    close: closeAssetModal,
    open: openAssetModal,
    update: updateAssetModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  const selectedOperator = watch('operator');
  const selectedAsset = watch('asset');

  const operators = useMemo<OperatorItem[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.entries())
      .filter(([, op]) => op.restakingStatus === 'ACTIVE')
      .map(([address, op]) => ({
        address,
        stake: op.restakingStake ?? BigInt(0),
        delegationCount: Number(op.restakingDelegationCount ?? BigInt(0)),
      }));
  }, [operatorMap]);

  const assetList = useMemo(() => {
    if (!assets) return [];
    return Array.from(assets.values());
  }, [assets]);

  const selectedAssetData = useMemo(() => {
    if (!selectedAsset || !assets) return null;
    return assets.get(selectedAsset) ?? null;
  }, [selectedAsset, assets]);

  const handleOperatorSelection = useCallback(
    (operator: OperatorItem) => {
      setValue('operator', operator.address);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  const handleAssetSelection = useCallback(
    (asset: { id: Address }) => {
      setValue('asset', asset.id);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

  const displayError = useMemo(() => {
    return !selectedOperator
      ? 'Select Operator'
      : !selectedAsset
        ? 'Select Asset'
        : undefined;
  }, [selectedOperator, selectedAsset]);

  const isTransacting =
    isSubmitting ||
    createStatus === TxStatus.PROCESSING ||
    createAllStatus === TxStatus.PROCESSING;

  const isReady =
    (executeCreate !== null || executeCreateAll !== null) &&
    selectedOperator !== undefined &&
    selectedAsset !== undefined &&
    userAddress !== undefined &&
    !isTransacting;

  const onSubmit = useCallback<SubmitHandler<CreateVaultFormFields>>(
    async ({ operator, asset }) => {
      if (!isReady) return;

      if (useAllBlueprints && executeCreateAll) {
        await executeCreateAll({ operator, asset });
      } else if (executeCreate) {
        await executeCreate({
          operator,
          asset,
          blueprintIds: [BigInt(0)], // Default to blueprint 0 for now
        });
      }

      reset();
    },
    [isReady, useAllBlueprints, executeCreate, executeCreateAll, reset],
  );

  return (
    <StyleContainer>
      <LiquidStakingActionTabs />

      <Card withShadow tightPadding className="relative md:min-w-[512px]">
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <TransactionInputCard.Root className="bg-mono-20 dark:bg-mono-180">
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Operator"
                  onClick={openOperatorModal}
                  {...(selectedOperator
                    ? {
                        renderBody: () => (
                          <div className="flex flex-col">
                            <span className="font-mono text-sm">
                              {selectedOperator.slice(0, 8)}...
                              {selectedOperator.slice(-6)}
                            </span>
                            <span className="text-xs text-mono-100">
                              Operator
                            </span>
                          </div>
                        ),
                      }
                    : {})}
                />
              </TransactionInputCard.Header>
            </TransactionInputCard.Root>

            <TransactionInputCard.Root className="bg-mono-20 dark:bg-mono-180">
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Asset"
                  onClick={openAssetModal}
                  {...(selectedAssetData
                    ? {
                        renderBody: () => (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {selectedAssetData.metadata.symbol}
                            </span>
                            <span className="text-xs text-mono-100">
                              {selectedAssetData.metadata.name}
                            </span>
                          </div>
                        ),
                      }
                    : {})}
                />
              </TransactionInputCard.Header>
            </TransactionInputCard.Root>
          </div>

          <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-160 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Typography variant="body1" fw="medium">
                  All Blueprints Mode
                </Typography>
                <Typography variant="body2" className="text-mono-100">
                  Delegate to all available blueprints
                </Typography>
              </div>
              <Switcher
                checked={useAllBlueprints}
                onCheckedChange={setUseAllBlueprints}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50/10 border border-blue-50/20">
            <Typography variant="body2" className="text-blue-50">
              Creating a vault allows users to deposit assets and receive liquid
              staking tokens (ldTokens) that represent their share of the
              vault&apos;s delegated position.
            </Typography>
          </div>

          <ActionButtonBase>
            {(isLoading, loadingText) => {
              const activeChainSupported =
                isDefined(activeTypedChainId) &&
                SUPPORTED_RESTAKE_DEPOSIT_TYPED_CHAIN_IDS.includes(
                  activeTypedChainId,
                );

              if (!activeChainSupported) {
                return (
                  <Button
                    isFullWidth
                    type="button"
                    isLoading={isLoading}
                    loadingText={loadingText}
                    onClick={openChainModal}
                  >
                    Switch to supported chain
                  </Button>
                );
              }

              return (
                <Button
                  isDisabled={!isValid || isDefined(displayError) || !isReady}
                  type="submit"
                  isFullWidth
                  isLoading={isTransacting || isLoading}
                  loadingText={loadingText}
                >
                  {displayError ?? 'Create Vault'}
                </Button>
              );
            }}
          </ActionButtonBase>
        </form>
      </Card>

      <ListModal
        title="Select Operator"
        isOpen={operatorModalOpen}
        setIsOpen={updateOperatorModal}
        onSelect={handleOperatorSelection}
        filterItem={(operator, query) => filterBy(query, [operator.address])}
        searchInputId="create-vault-operator-search"
        searchPlaceholder="Search operators..."
        titleWhenEmpty="No Operators Found"
        descriptionWhenEmpty="No active operators found on this network."
        items={operators}
        isLoading={isLoadingOperators}
        renderItem={(operator) => (
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-mono text-sm">
                {operator.address.slice(0, 10)}...{operator.address.slice(-8)}
              </span>
              <span className="text-xs text-mono-100">
                {operator.delegationCount} delegations
              </span>
            </div>
          </div>
        )}
      />

      <ListModal
        title="Select Asset"
        isOpen={assetModalOpen}
        setIsOpen={updateAssetModal}
        onSelect={handleAssetSelection}
        filterItem={(asset, query) =>
          filterBy(query, [
            asset.id,
            asset.metadata.name,
            asset.metadata.symbol,
          ])
        }
        searchInputId="create-vault-asset-search"
        searchPlaceholder="Search assets..."
        titleWhenEmpty="No Assets Found"
        descriptionWhenEmpty="No restaking assets found on this network."
        items={assetList}
        isLoading={isLoadingAssets}
        renderItem={(asset) => (
          <div className="flex items-center justify-between w-full p-2">
            <div className="flex flex-col">
              <span className="font-medium">{asset.metadata.symbol}</span>
              <span className="text-xs text-mono-100">
                {asset.metadata.name}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">
                {formatUnits(asset.balance, asset.metadata.decimals)}
              </span>
              <span className="text-xs text-mono-100">Balance</span>
            </div>
          </div>
        )}
      />

      <Modal open={isChainModalOpen} onOpenChange={updateChainModal}>
        <SupportedChainModal
          onClose={closeChainModal}
          onChainChange={async (chainConfig) => {
            const typedChainId = calculateTypedChainId(
              chainConfig.chainType,
              chainConfig.id,
            );

            await switchChain(typedChainId);
            closeChainModal();
          }}
        />
      </Modal>
    </StyleContainer>
  );
};

export default CreateVaultForm;
