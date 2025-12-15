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
import { BN } from '@polkadot/util';
import { useAccount } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
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
  useLiquidDelegationVaults,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import { useRestakeAssets } from '@tangle-network/tangle-shared-ui/data/graphql';
import { useOperatorMap } from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { Switcher } from '@tangle-network/ui-components/components/Switcher';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import AssetListItem from '../../../components/Lists/AssetListItem';
import { Avatar, shortenHex } from '@tangle-network/ui-components';
import { Alert, TokenIcon } from '@tangle-network/icons';

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
  const queryClient = useQueryClient();
  const activeTypedChainId = useActiveTypedChainId();
  const switchChain = useSwitchChain();

  const { assets, isLoading: isLoadingAssets } = useRestakeAssets();
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap();

  const {
    status: createStatus,
    execute: executeCreate,
    error: createError,
  } = useCreateVault();
  const {
    status: createAllStatus,
    execute: executeCreateAll,
    error: createAllError,
  } = useCreateAllBlueprintsVault();
  const { vaults: existingVaults } = useLiquidDelegationVaults();

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

  const existingVault = useMemo(() => {
    if (!existingVaults || !selectedOperator || !selectedAsset) {
      return null;
    }

    // Current UI supports either:
    // - All blueprints mode (empty blueprintIds)
    // - Fixed mode with blueprintIds [0] (until we add selection UI)
    const expectedBlueprintIds = useAllBlueprints ? [] : [BigInt(0)];

    return (
      existingVaults.find((vault) => {
        if (
          vault.operator.toLowerCase() !== selectedOperator.toLowerCase() ||
          vault.asset.toLowerCase() !== selectedAsset.toLowerCase()
        ) {
          return false;
        }

        if (vault.blueprintIds.length !== expectedBlueprintIds.length) {
          return false;
        }

        for (let i = 0; i < expectedBlueprintIds.length; i++) {
          if (vault.blueprintIds[i] !== expectedBlueprintIds[i]) {
            return false;
          }
        }

        return true;
      }) ?? null
    );
  }, [existingVaults, selectedOperator, selectedAsset, useAllBlueprints]);

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

  const selectedOperatorData = useMemo(() => {
    if (!selectedOperator) return null;
    return operators.find((op) => op.address === selectedOperator) ?? null;
  }, [operators, selectedOperator]);

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
        : existingVault
          ? 'Vault already exists'
        : undefined;
  }, [existingVault, selectedOperator, selectedAsset]);

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

  const submitError = useMemo(() => {
    return createAllError ?? createError ?? null;
  }, [createAllError, createError]);

	  const onSubmit = useCallback<SubmitHandler<CreateVaultFormFields>>(
	    async ({ operator, asset }) => {
	      if (!isReady) return;
	      if (existingVault) return;

	      let txResult = null;
	      if (useAllBlueprints && executeCreateAll) {
	        txResult = await executeCreateAll({ operator, asset });
	      } else if (executeCreate) {
	        txResult = await executeCreate({
	          operator,
	          asset,
	          blueprintIds: [BigInt(0)], // Default to blueprint 0 for now
	        });
	      }

	      if (txResult?.status === 'success') {
	        await queryClient.invalidateQueries({
	          queryKey: ['liquidDelegation', 'vaults'],
	        });
	        reset();
	      }
	    },
	    [
	      executeCreate,
	      executeCreateAll,
      existingVault,
      isReady,
      queryClient,
      reset,
      useAllBlueprints,
    ],
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
                          <div className="flex items-center gap-2">
                            <Avatar
                              size="md"
                              theme="ethereum"
                              value={selectedOperator}
                            />
                            <div className="flex flex-col">
                              <Typography
                                variant="h5"
                                fw="bold"
                                component="span"
                                className="inline-block text-mono-200 dark:text-mono-40"
                              >
                                {shortenHex(selectedOperator)}
                              </Typography>
                              <Typography
                                variant="body3"
                                component="span"
                                className="text-mono-120 dark:text-mono-100"
                              >
                                {selectedOperatorData
                                  ? `${selectedOperatorData.delegationCount} total delegations`
                                  : 'Operator'}
                              </Typography>
                            </div>
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
                          <div className="flex items-center gap-2">
                            <TokenIcon
                              name={selectedAssetData.metadata.symbol}
                              size="lg"
                            />
                            <div className="flex flex-col">
                              <Typography variant="h5" fw="bold">
                                {selectedAssetData.metadata.symbol}
                              </Typography>
                              <Typography
                                variant="body3"
                                className="text-mono-120 dark:text-mono-100"
                              >
                                {selectedAssetData.metadata.name}
                              </Typography>
                            </div>
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

          {existingVault && (
            <div className="p-4 rounded-xl bg-yellow-50/10 border border-yellow-50/20">
              <div className="flex items-start gap-3">
                <Alert className="w-5 h-5 text-yellow-50 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2">
                  <Typography
                    variant="body2"
                    fw="semibold"
                    className="text-yellow-50"
                  >
                    Vault already exists for this selection
                  </Typography>
                  <Typography variant="body2" className="text-yellow-50/80">
                    {shortenHex(existingVault.address)}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-3">
                <Alert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <Typography
                    variant="body2"
                    fw="semibold"
                    className="text-red-400"
                  >
                    Vault creation failed
                  </Typography>
                  <Typography variant="body2" className="text-red-400/80">
                    {submitError.message}
                  </Typography>
                </div>
              </div>
            </div>
          )}

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
        getItemKey={(operator) => operator.address}
        renderItem={(operator) => (
          <OperatorListItem
            accountAddress={operator.address}
            totalDelegations={operator.delegationCount}
          />
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
        getItemKey={(asset) => asset.id}
        renderItem={(asset) => (
          <AssetListItem
            assetId={asset.id}
            name={asset.metadata.name}
            symbol={asset.metadata.symbol}
            balance={new BN(asset.balance.toString())}
            decimals={asset.metadata.decimals}
          />
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
