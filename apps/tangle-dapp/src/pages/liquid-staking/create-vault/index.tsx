import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import ListModal from '@tangle-network/tangle-shared-ui/components/ListModal';
import {
  Card,
  Input,
  ListItem,
  Modal as UiModal,
  ModalContent,
  ModalHeader,
} from '@tangle-network/ui-components';
import { ScrollArea } from '@tangle-network/ui-components/components/ScrollArea';
import Button from '@tangle-network/ui-components/components/buttons/Button';
import { Modal } from '@tangle-network/ui-components/components/Modal';
import { CheckBox } from '@tangle-network/ui-components/components/CheckBox';
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
  useCreateAllBlueprintsVault,
  useCreateVault,
  useLiquidDelegationVaults,
} from '@tangle-network/tangle-shared-ui/data/liquidDelegation';
import {
  useBlueprints,
  useOperatorMap,
  useRestakeAssets,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import filterBy from '@tangle-network/tangle-shared-ui/utils/filterBy';
import { Switcher } from '@tangle-network/ui-components/components/Switcher';
import OperatorListItem from '../../../components/Lists/OperatorListItem';
import AssetListItem from '../../../components/Lists/AssetListItem';
import { Avatar, shortenHex } from '@tangle-network/ui-components';
import { Alert, Search, TokenIcon } from '@tangle-network/icons';

type CreateVaultFormFields = {
  operator: Address;
  asset: Address;
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
  const { data: blueprints, isLoading: isLoadingBlueprints } = useBlueprints();

  const createVaultTx = useCreateVault();
  const createAllBlueprintsVaultTx = useCreateAllBlueprintsVault();
  const { vaults: existingVaults } = useLiquidDelegationVaults();

  const [useAllBlueprints, setUseAllBlueprints] = useState(true);
  const [selectedBlueprintIdStrings, setSelectedBlueprintIdStrings] = useState<
    string[]
  >([]);
  const [blueprintSearchQuery, setBlueprintSearchQuery] = useState('');

  const {
    register,
    setValue: setFormValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors: _errors, isSubmitting, isValid },
  } = useForm<CreateVaultFormFields>({
    mode: 'onChange',
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
    setSelectedBlueprintIdStrings([]);
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
    status: blueprintModalOpen,
    close: closeBlueprintModal,
    open: openBlueprintModal,
    update: updateBlueprintModal,
  } = useModal();

  const {
    status: isChainModalOpen,
    open: openChainModal,
    close: closeChainModal,
    update: updateChainModal,
  } = useModal();

  const selectedOperator = watch('operator');
  const selectedAsset = watch('asset');

  const allBlueprintIds = useMemo(() => {
    if (!Array.isArray(blueprints)) return [];
    return blueprints.map((bp) => bp.blueprintId);
  }, [blueprints]);

  const selectedBlueprintIds = useMemo(() => {
    return selectedBlueprintIdStrings
      .map((id) => {
        try {
          return BigInt(id);
        } catch {
          return null;
        }
      })
      .filter((id): id is bigint => id !== null);
  }, [selectedBlueprintIdStrings]);

  const effectiveBlueprintIds = useMemo(() => {
    if (useAllBlueprints) return [];
    return [...selectedBlueprintIds].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }, [selectedBlueprintIds, useAllBlueprints]);

  const existingVault = useMemo(() => {
    if (!existingVaults || !selectedOperator || !selectedAsset) {
      return null;
    }

    return (
      existingVaults.find((vault) => {
        if (
          vault.operator.toLowerCase() !== selectedOperator.toLowerCase() ||
          vault.asset.toLowerCase() !== selectedAsset.toLowerCase()
        ) {
          return false;
        }

        if (useAllBlueprints) {
          return vault.blueprintIds.length === 0;
        }

        if (effectiveBlueprintIds.length === 0) {
          return false;
        }

        const vaultBlueprintIds = [...vault.blueprintIds].sort((a, b) =>
          a < b ? -1 : a > b ? 1 : 0,
        );

        if (vaultBlueprintIds.length !== effectiveBlueprintIds.length) {
          return false;
        }

        for (let i = 0; i < effectiveBlueprintIds.length; i++) {
          if (vaultBlueprintIds[i] !== effectiveBlueprintIds[i]) {
            return false;
          }
        }

        return true;
      }) ?? null
    );
  }, [
    effectiveBlueprintIds,
    existingVaults,
    selectedAsset,
    selectedOperator,
    useAllBlueprints,
  ]);

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
        : !useAllBlueprints && effectiveBlueprintIds.length === 0
          ? 'Select Blueprints'
          : existingVault
            ? 'Vault already exists'
            : undefined;
  }, [
    effectiveBlueprintIds.length,
    existingVault,
    isLoadingBlueprints,
    selectedAsset,
    selectedOperator,
    useAllBlueprints,
  ]);

  const activeCreateTx = useAllBlueprints
    ? createAllBlueprintsVaultTx
    : createVaultTx;

  const isTransacting =
    isSubmitting || activeCreateTx.status === TxStatus.PROCESSING;

  const isReady =
    activeCreateTx.execute !== null &&
    selectedOperator !== undefined &&
    selectedAsset !== undefined &&
    userAddress !== undefined &&
    !isTransacting;

  const submitError = useMemo(() => {
    return activeCreateTx.error ?? null;
  }, [activeCreateTx.error]);

  const onSubmit = useCallback<SubmitHandler<CreateVaultFormFields>>(
    async ({ operator, asset }) => {
      if (!isReady) return;
      if (existingVault) return;

      const txResult = useAllBlueprints
        ? await createAllBlueprintsVaultTx.execute({ operator, asset })
        : effectiveBlueprintIds.length === 0
          ? null
          : await createVaultTx.execute({
              operator,
              asset,
              blueprintIds: effectiveBlueprintIds,
            });

      if (txResult?.status === 'success') {
        await queryClient.invalidateQueries({
          queryKey: ['liquidDelegation', 'vaults'],
        });
        reset();
      }
    },
    [
      createAllBlueprintsVaultTx.execute,
      createVaultTx.execute,
      existingVault,
      effectiveBlueprintIds,
      isReady,
      queryClient,
      reset,
      useAllBlueprints,
    ],
  );

  const blueprintOptions = useMemo(() => {
    if (!Array.isArray(blueprints)) return [];

    const q = blueprintSearchQuery.trim().toLowerCase();
    const filtered =
      q.length === 0
        ? blueprints
        : blueprints.filter((bp) => {
            return (
              bp.blueprintId.toString().includes(q) ||
              bp.owner.toLowerCase().includes(q)
            );
          });

    return [...filtered].sort((a, b) =>
      a.blueprintId < b.blueprintId
        ? -1
        : a.blueprintId > b.blueprintId
          ? 1
          : 0,
    );
  }, [blueprintSearchQuery, blueprints]);

  const selectedBlueprintCountLabel = useMemo(() => {
    if (useAllBlueprints) {
      return allBlueprintIds.length > 0
        ? `All blueprints (${allBlueprintIds.length})`
        : 'All blueprints';
    }

    if (effectiveBlueprintIds.length === 0) {
      return 'Select blueprints';
    }

    return `${effectiveBlueprintIds.length} blueprint${
      effectiveBlueprintIds.length === 1 ? '' : 's'
    } selected`;
  }, [allBlueprintIds.length, effectiveBlueprintIds.length, useAllBlueprints]);

  const toggleBlueprintSelection = useCallback((blueprintId: string) => {
    setSelectedBlueprintIdStrings((prev) => {
      if (prev.includes(blueprintId)) {
        return prev.filter((id) => id !== blueprintId);
      }
      return [...prev, blueprintId];
    });
  }, []);

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

            <TransactionInputCard.Root className="bg-mono-20 dark:bg-mono-180">
              <TransactionInputCard.Header>
                <TransactionInputCard.ChainSelector
                  placeholder="Select Blueprints"
                  onClick={() => {
                    if (useAllBlueprints) return;
                    openBlueprintModal();
                  }}
                  {...(effectiveBlueprintIds.length > 0 || useAllBlueprints
                    ? {
                        renderBody: () => (
                          <div className="flex flex-col">
                            <Typography variant="h5" fw="bold">
                              {selectedBlueprintCountLabel}
                            </Typography>
                            <Typography
                              variant="body3"
                              className="text-mono-120 dark:text-mono-100"
                            >
                              {useAllBlueprints
                                ? 'Delegating to all current and future blueprints'
                                : 'Click to change selection'}
                            </Typography>
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
                  Delegate to all current and future blueprints (as the operator registers them)
                </Typography>
              </div>
              <Switcher
                checked={useAllBlueprints}
                onCheckedChange={(checked) => {
                  setUseAllBlueprints(checked);
                  if (!checked) {
                    openBlueprintModal();
                  }
                }}
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

      <UiModal open={blueprintModalOpen} onOpenChange={updateBlueprintModal}>
        <ModalContent size="md" className="max-h-[600px]">
          <ModalHeader className="pb-4">Select Blueprints</ModalHeader>

          <div className="px-4 pb-4 md:px-9">
            <Input
              id="create-vault-blueprint-search"
              isControlled
              rightIcon={<Search className="mr-2" />}
              placeholder="Search by blueprint ID or owner..."
              value={blueprintSearchQuery}
              onChange={setBlueprintSearchQuery}
              inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120"
            />
          </div>

          <hr className="w-full border-b border-mono-40 dark:border-mono-170" />

          <div className="px-4 pt-4 md:px-9 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isDisabled={!Array.isArray(blueprints) || blueprints.length === 0}
              onClick={() => {
                if (!Array.isArray(blueprints)) return;
                setSelectedBlueprintIdStrings(
                  blueprints.map((bp) => bp.blueprintId.toString()),
                );
              }}
            >
              Select all
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              isDisabled={selectedBlueprintIdStrings.length === 0}
              onClick={() => setSelectedBlueprintIdStrings([])}
            >
              Clear
            </Button>
          </div>

          <div className="h-full max-h-[380px] overflow-y-auto">
            <ScrollArea className="w-full h-full pt-4">
              {isLoadingBlueprints ? (
                <div className="px-8 py-10">
                  <Typography variant="body2" className="text-mono-120">
                    Loading blueprints…
                  </Typography>
                </div>
              ) : blueprintOptions.length === 0 ? (
                <div className="px-8 py-10">
                  <Typography variant="body2" className="text-mono-120">
                    No blueprints found.
                  </Typography>
                </div>
              ) : (
                <ul>
                  {blueprintOptions.map((bp) => {
                    const blueprintIdString = bp.blueprintId.toString();
                    const isChecked =
                      selectedBlueprintIdStrings.includes(blueprintIdString);

                    return (
                      <ListItem
                        key={blueprintIdString}
                        onClick={() =>
                          toggleBlueprintSelection(blueprintIdString)
                        }
                        className="w-full flex items-center gap-4 justify-between max-w-full min-h-[60px] py-3 cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <Typography variant="body1" fw="medium">
                            Blueprint #{blueprintIdString}
                          </Typography>
                          <Typography
                            variant="body3"
                            className="text-mono-120 dark:text-mono-100"
                          >
                            Owner: {shortenHex(bp.owner)}
                          </Typography>
                        </div>

                        <CheckBox
                          id={`create-vault-blueprint-${blueprintIdString}`}
                          isChecked={isChecked}
                          onChange={(event) => {
                            event.stopPropagation();
                            toggleBlueprintSelection(blueprintIdString);
                          }}
                        />
                      </ListItem>
                    );
                  })}
                </ul>
              )}
            </ScrollArea>
          </div>

          <div className="px-4 py-4 md:px-9 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={closeBlueprintModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              isDisabled={selectedBlueprintIdStrings.length === 0}
              onClick={() => {
                closeBlueprintModal();
              }}
            >
              Confirm
            </Button>
          </div>
        </ModalContent>
      </UiModal>
    </StyleContainer>
  );
};

export default CreateVaultForm;
