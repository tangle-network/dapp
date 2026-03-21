import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import { TokenIcon } from '@tangle-network/icons';
import { Avatar, Card, Input, shortenHex } from '@tangle-network/ui-components';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { ModalContent } from '@tangle-network/ui-components/components/Modal/ModalContent';
import { ModalHeader } from '@tangle-network/ui-components/components/Modal/ModalHeader';
import { TransactionInputCard } from '@tangle-network/ui-components/components/TransactionInputCard';
import { useModal } from '@tangle-network/ui-components/hooks/useModal';
import { Typography } from '@tangle-network/ui-components/typography/Typography';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import useFormSetValue from '../../../hooks/useFormSetValue';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import ActionButtonBase from '../../../components/staking/ActionButtonBase';
import StyleContainer from '../../../components/staking/StyleContainer';
import { SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS } from '../../../constants/staking';
import useActiveTypedChainId from '../../../hooks/useActiveTypedChainId';
import SupportedChainModal from '../../staking/SupportedChainModal';
import useSwitchChain from '../../staking/useSwitchChain';
import LiquidStakingActionTabs from '../LiquidStakingActionTabs';
import {
  useCreateVault,
  useCreateAllBlueprintsVault,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import {
  useBlueprintsWithMetadata,
  useOperatorMap,
  useStakingAssets,
  type StakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { Switcher } from '@tangle-network/ui-components/components/Switcher';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import AssetListItem from '../../../components/Lists/AssetListItem';

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

  const { assets, isLoading: isLoadingAssets } = useStakingAssets();
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap();
  const {
    data: blueprints,
    isLoading: isLoadingBlueprints,
    error: blueprintsError,
  } = useBlueprintsWithMetadata();

  const { status: createStatus, execute: executeCreate } = useCreateVault();
  const { status: createAllStatus, execute: executeCreateAll } =
    useCreateAllBlueprintsVault();

  const [useAllBlueprints, setUseAllBlueprints] = useState(true);
  const [selectedBlueprintIds, setSelectedBlueprintIds] = useState<bigint[]>(
    [],
  );
  const [blueprintSearch, setBlueprintSearch] = useState('');

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

  const setValue = useFormSetValue(setFormValue);

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
  const {
    status: blueprintModalOpen,
    open: openBlueprintModal,
    close: closeBlueprintModal,
    update: updateBlueprintModal,
  } = useModal();

  const selectedOperator = watch('operator');
  const selectedAsset = watch('asset');

  const operators = useMemo<OperatorItem[]>(() => {
    if (!operatorMap) return [];

    return Array.from(operatorMap.entries())
      .filter(([, op]) => op.stakingStatus === 'ACTIVE')
      .map(([address, op]) => ({
        address,
        stake: op.stakingStake ?? BigInt(0),
        delegationCount: Number(op.stakingDelegationCount ?? BigInt(0)),
      }));
  }, [operatorMap]);

  const assetList = useMemo<StakingAsset[]>(() => {
    if (!assets) return [];
    return Array.from(assets.values()) as StakingAsset[];
  }, [assets]);

  const selectedAssetData = useMemo<StakingAsset | null>(() => {
    if (!selectedAsset || !assets) return null;
    return (assets.get(selectedAsset) as StakingAsset | undefined) ?? null;
  }, [selectedAsset, assets]);

  const selectedOperatorData = useMemo(() => {
    if (!selectedOperator || !operators.length) return null;
    return operators.find((op) => op.address === selectedOperator) ?? null;
  }, [selectedOperator, operators]);

  const blueprintItems = useMemo(() => {
    return blueprints ?? [];
  }, [blueprints]);

  const filteredBlueprints = useMemo(() => {
    if (!blueprintItems.length) return [];
    const query = blueprintSearch.trim();
    if (query.length === 0) return blueprintItems;
    return blueprintItems.filter((bp) =>
      filterBy(query, [
        bp.blueprintId.toString(),
        bp.name,
        bp.category,
        bp.owner,
      ]),
    );
  }, [blueprintItems, blueprintSearch]);

  const selectedBlueprintNames = useMemo(() => {
    if (selectedBlueprintIds.length === 0) return [];
    const nameMap = new Map(
      blueprintItems.map((bp) => [bp.blueprintId.toString(), bp.name]),
    );
    return selectedBlueprintIds.map(
      (id) => nameMap.get(id.toString()) ?? `Blueprint #${id.toString()}`,
    );
  }, [blueprintItems, selectedBlueprintIds]);

  const selectedBlueprintSummary = useMemo(() => {
    if (selectedBlueprintNames.length === 0) return 'No blueprints selected';
    if (selectedBlueprintNames.length <= 3) {
      return selectedBlueprintNames.join(', ');
    }
    const [first, second, third] = selectedBlueprintNames;
    const remaining = selectedBlueprintNames.length - 3;
    return `${first}, ${second}, ${third} +${remaining} more`;
  }, [selectedBlueprintNames]);

  const handleOperatorSelection = useCallback(
    (operator: OperatorItem) => {
      setValue('operator', operator.address);
      closeOperatorModal();
    },
    [closeOperatorModal, setValue],
  );

  const handleAssetSelection = useCallback(
    (asset: StakingAsset) => {
      setValue('asset', asset.id);
      closeAssetModal();
    },
    [closeAssetModal, setValue],
  );

  const toggleBlueprintSelection = useCallback((id: bigint) => {
    setSelectedBlueprintIds((prev) => {
      const exists = prev.some((value) => value === id);
      if (exists) {
        return prev.filter((value) => value !== id);
      }
      return [...prev, id];
    });
  }, []);

  const handleAllBlueprintsChange = useCallback(
    (checked: boolean) => {
      setUseAllBlueprints(checked);
      setValue('useAllBlueprints', checked);
      if (checked) {
        setSelectedBlueprintIds([]);
      } else {
        openBlueprintModal();
      }
    },
    [openBlueprintModal, setValue],
  );

  const displayError = useMemo(() => {
    return !selectedOperator
      ? 'Select Operator'
      : !selectedAsset
        ? 'Select Asset'
        : !useAllBlueprints && selectedBlueprintIds.length === 0
          ? 'Select Blueprints'
          : undefined;
  }, [
    selectedOperator,
    selectedAsset,
    selectedBlueprintIds.length,
    useAllBlueprints,
  ]);

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
        if (selectedBlueprintIds.length === 0) {
          return;
        }
        await executeCreate({
          operator,
          asset,
          blueprintIds: selectedBlueprintIds,
        });
      }

      reset();
    },
    [
      executeCreate,
      executeCreateAll,
      isReady,
      reset,
      selectedBlueprintIds,
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
                              <Typography
                                variant="h5"
                                fw="bold"
                                component="span"
                                className="inline-block text-mono-200 dark:text-mono-40"
                              >
                                {selectedAssetData.metadata.symbol}
                              </Typography>
                              <Typography
                                variant="body3"
                                component="span"
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
                onCheckedChange={handleAllBlueprintsChange}
              />
            </div>
          </div>

          {!useAllBlueprints && (
            <div className="p-3 rounded-lg bg-mono-20 dark:bg-mono-160 space-y-2">
              <div className="flex items-center justify-between">
                <Typography variant="body1" fw="medium">
                  Selected Blueprints
                </Typography>
                <Button
                  size="sm"
                  variant="utility"
                  onClick={openBlueprintModal}
                >
                  Choose
                </Button>
              </div>
              <Typography variant="body2" className="text-mono-100">
                {selectedBlueprintSummary}
              </Typography>
            </div>
          )}

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
                SUPPORTED_STAKING_DEPOSIT_TYPED_CHAIN_IDS.includes(
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
        getItemKey={(item) => item.address}
        renderItem={(operator) => (
          <OperatorListItem
            accountAddress={operator.address}
            totalDelegations={operator.delegationCount}
          />
        )}
      />

      <ListModal<StakingAsset>
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
        descriptionWhenEmpty="No staking assets found on this network."
        items={assetList}
        isLoading={isLoadingAssets}
        getItemKey={(item) => item.id}
        renderItem={(asset) => (
          <AssetListItem
            assetId={asset.id}
            name={asset.metadata.name}
            symbol={asset.metadata.symbol}
            balance={asset.balance ?? BigInt(0)}
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

      <Modal open={blueprintModalOpen} onOpenChange={updateBlueprintModal}>
        <ModalContent size="md" className="max-h-[600px]">
          <ModalHeader className="pb-4">Select Blueprints</ModalHeader>
          <div className="px-4 pb-4 md:px-9">
            <Input
              id="create-vault-blueprint-search"
              isControlled
              placeholder="Search blueprints..."
              value={blueprintSearch}
              onChange={setBlueprintSearch}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          </div>
          <hr className="w-full border-b border-mono-40 dark:border-mono-170" />
          <div className="max-h-[420px] overflow-y-auto px-4 py-4 md:px-9 space-y-3">
            {isLoadingBlueprints && (
              <Typography variant="body2" className="text-mono-100">
                Loading blueprints...
              </Typography>
            )}
            {blueprintsError && (
              <Typography variant="body2" className="text-red-50">
                Failed to load blueprints.
              </Typography>
            )}
            {!isLoadingBlueprints &&
              !blueprintsError &&
              filteredBlueprints.length === 0 && (
                <Typography variant="body2" className="text-mono-100">
                  No blueprints found.
                </Typography>
              )}
            {!isLoadingBlueprints &&
              !blueprintsError &&
              filteredBlueprints.map((bp) => {
                const blueprintId = bp.blueprintId;
                const isChecked = selectedBlueprintIds.some(
                  (value) => value === blueprintId,
                );
                return (
                  <div
                    key={bp.id}
                    className="flex items-start gap-3 p-2 rounded-lg bg-mono-10 dark:bg-mono-170"
                  >
                    <CheckBox
                      id={`blueprint-${bp.blueprintId.toString()}`}
                      isChecked={isChecked}
                      onChange={() => toggleBlueprintSelection(blueprintId)}
                      labelVariant="body2"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{bp.name}</span>
                        <span className="text-xs text-mono-100">
                          Blueprint #{bp.blueprintId.toString()}
                        </span>
                      </div>
                    </CheckBox>
                  </div>
                );
              })}
          </div>
          <div className="px-4 pb-4 md:px-9">
            <Button isFullWidth onClick={closeBlueprintModal}>
              Done
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </StyleContainer>
  );
};

export default CreateVaultForm;
