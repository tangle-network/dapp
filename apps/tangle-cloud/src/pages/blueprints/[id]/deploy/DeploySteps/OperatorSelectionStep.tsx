import {
  Input,
  Card,
  Chip,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Text,
} from '../../../../../components/sandbox/SandboxUi';
import { FC, MouseEvent, useEffect, useMemo, useState, Children } from 'react';
import { SelectOperatorsStepProps, OperatorSelectionTable } from './type';
import { RowSelectionState } from '@tanstack/react-table';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { Search, CheckLineIcon, Close } from '@tangle-network/icons';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { OperatorTable } from './components/OperatorTable';
import {
  useStakingAssets,
  type StakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  useBlueprintConfig,
  MembershipModel,
} from '@tangle-network/tangle-shared-ui/data/services';
import { getMembershipLabel } from '../../../../../types/serviceRequest';
import { Address } from 'viem';

const MAX_ASSET_TO_SHOW = 3;

export const SelectOperatorsStep: FC<SelectOperatorsStepProps> = ({
  errors,
  setValue,
  watch,
  blueprint,
  blueprintOperators,
}) => {
  const watchedOperators = watch('operators');
  const selectedOperators = useMemo(
    () => watchedOperators ?? [],
    [watchedOperators],
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    selectedOperators.reduce((acc, operator) => {
      acc[operator] = true;
      return acc;
    }, {} as RowSelectionState),
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch blueprint config from contract to get membership model settings
  const { data: blueprintConfig, isLoading: isConfigLoading } =
    useBlueprintConfig(blueprint?.id);

  // Fetch staking assets from GraphQL indexer
  const { assets: assetMap } = useStakingAssets();

  // Use operators registered for this blueprint from the parent component
  const operators = useMemo<OperatorSelectionTable[]>(() => {
    if (!blueprintOperators || blueprintOperators.length === 0) return [];

    return blueprintOperators.map((operator) => {
      return {
        address: operator.address as Address,
        identityName: operator.identityName,
        stakersCount: operator.stakersCount ?? 0,
        vaultTokensInUsd: operator.tvlInUsd ?? 0,
        selfBondedAmount: operator.selfBondedAmount,
        vaultTokens: operator.vaultTokens,
        instanceCount: operator.instanceCount,
        pricing: {
          cpu: 0,
          mem: 0,
          storage: 0,
        },
      };
    });
  }, [blueprintOperators]);

  const selectedAssets = watch('assets');
  const requestMode = watch('requestMode') ?? 'basic';
  const securityCommitments = watch('securityCommitments') ?? [];
  const selectedOperatorsCount = Object.keys(rowSelection).length;

  const tableData = useMemo(() => {
    if (!Array.isArray(selectedAssets) || selectedAssets.length === 0) {
      return operators;
    }

    const selectedSymbols = new Set(
      selectedAssets.map((asset) => asset.metadata?.symbol),
    );

    const filtered = operators.filter((operator) =>
      operator.vaultTokens?.some((vaultToken) =>
        selectedSymbols.has(vaultToken.symbol),
      ),
    );

    return filtered.length > 0 ? filtered : operators;
  }, [operators, selectedAssets]);

  // Set the operators to the form value when the rowSelection changes
  useEffect(() => {
    setValue(`operators`, Object.keys(rowSelection) as Address[]);
  }, [rowSelection, setValue]);

  useEffect(() => {
    if (selectedOperators.length === 0) {
      return;
    }

    const nextSelection = selectedOperators.reduce((acc, operator) => {
      acc[operator] = true;
      return acc;
    }, {} as RowSelectionState);

    const currentKeys = Object.keys(rowSelection).filter(
      (key) => rowSelection[key],
    );
    const nextKeys = Object.keys(nextSelection);
    const isSame =
      currentKeys.length === nextKeys.length &&
      nextKeys.every((key) => rowSelection[key]);

    if (!isSame) {
      setRowSelection(nextSelection);
    }
  }, [rowSelection, selectedOperators]);

  const onSelectAsset = (asset: StakingAsset, isChecked: boolean) => {
    const selectedAssets_ = Array.from(selectedAssets ?? []);
    const newSelectedAssets = isChecked
      ? [
          ...selectedAssets_,
          {
            id: asset.id,
            metadata: {
              symbol: asset.metadata.symbol,
              name: asset.metadata.name,
              decimals: asset.metadata.decimals,
              priceInUsd: null,
            },
          },
        ]
      : selectedAssets.filter((selectedAsset) => selectedAsset.id !== asset.id);

    setValue(`assets`, newSelectedAssets);

    if (requestMode === 'security') {
      const nextSecurityCommitments = newSelectedAssets.map((selectedAsset) => {
        return {
          asset: selectedAsset.id,
          minExposurePercent: 1,
          maxExposurePercent: 100,
        };
      });
      setValue('securityCommitments', nextSecurityCommitments);
    }
  };

  useEffect(() => {
    const assetCount = selectedAssets?.length ?? 0;

    if (requestMode !== 'security') {
      if (securityCommitments.length > 0) {
        setValue('securityCommitments', []);
      }
      return;
    }

    if (assetCount === 0) {
      if (securityCommitments.length > 0) {
        setValue('securityCommitments', []);
      }
      return;
    }

    if (securityCommitments.length !== assetCount) {
      setValue(
        'securityCommitments',
        (selectedAssets ?? []).map((asset) => ({
          asset: asset.id,
          minExposurePercent: 1,
          maxExposurePercent: 100,
        })),
      );
    }
  }, [requestMode, securityCommitments.length, selectedAssets, setValue]);

  // Calculate min approvals required based on blueprint config
  // For Fixed: all operators must approve
  // For Dynamic: use minOperators from blueprint config
  const minApprovalsRequired = useMemo(() => {
    if (!blueprintConfig) return null;

    if (blueprintConfig.membership === MembershipModel.Fixed) {
      // Fixed: all selected operators must approve
      return selectedOperatorsCount > 0 ? selectedOperatorsCount : null;
    }

    // Dynamic: show blueprint's minOperators requirement
    return blueprintConfig.minOperators;
  }, [blueprintConfig, selectedOperatorsCount]);

  // Get all available assets for filtering
  const allAssets = useMemo<StakingAsset[]>(() => {
    if (!assetMap) return [];
    return Array.from(assetMap.values());
  }, [assetMap]);

  return (
    <Card className="p-5">
      <Text variant="h5" className="mb-4">
        Operators
      </Text>

      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Select>
            <SelectTrigger className="h-10">
              <SelectValue
                placeholder={
                  selectedAssets?.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Children.toArray(
                          selectedAssets
                            .slice(0, MAX_ASSET_TO_SHOW)
                            .map((asset) => (
                              <div>
                                <LsTokenIcon
                                  name={asset.metadata?.symbol ?? 'TNT'}
                                  size="md"
                                />
                              </div>
                            )),
                        )}
                        {selectedAssets?.length > MAX_ASSET_TO_SHOW && (
                          <Text variant="body1" className="ml-1">
                            ..
                          </Text>
                        )}
                      </div>
                      <Text variant="body1">
                        {selectedAssets?.length} asset(s) selected
                      </Text>
                    </div>
                  ) : (
                    `Filter by asset(s)`
                  )
                }
              />
            </SelectTrigger>

            <SelectContent>
              {Children.toArray(
                allAssets.map((asset) => {
                  const name = asset.metadata.name || 'Unknown';
                  const symbol = asset.metadata.symbol || 'TNT';
                  const isSelected = selectedAssets?.some(
                    (selectedAsset) => selectedAsset.id === asset.id,
                  );
                  return (
                    <SelectItem
                      value={asset.id}
                      id={asset.id}
                      onClick={(event: MouseEvent<HTMLDivElement>) => {
                        event.preventDefault();
                        onSelectAsset(asset, !isSelected);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={[
                            'flex h-4 w-4 items-center justify-center rounded border',
                            isSelected
                              ? 'border-primary bg-primary'
                              : 'border-border',
                          ].join(' ')}
                        >
                          {isSelected && (
                            <CheckLineIcon className="size-3 text-primary-foreground" />
                          )}
                        </span>
                        <LsTokenIcon name={symbol} size="md" />
                        <Text variant="body1">{name}</Text>
                      </div>
                    </SelectItem>
                  );
                }),
              )}
            </SelectContent>
          </Select>

          {errors?.assets?.message && (
            <ErrorMessage>{errors?.assets?.message}</ErrorMessage>
          )}
        </div>

        <div className="w-full sm:max-w-xs">
          <Input
            isControlled
            leftIcon={<Search />}
            id="deploy-operator-selection-search"
            placeholder="Search operator"
            value={searchQuery}
            onChange={setSearchQuery}
            inputClassName="h-10"
          />
        </div>
      </div>

      <OperatorTable
        enableRowSelection={true}
        onRowSelectionChange={(onChange) => {
          setRowSelection(onChange);
        }}
        initialState={{
          sorting: [
            {
              id: 'vaultTokensInUsd',
              desc: true,
            },
            {
              id: 'instanceCount',
              desc: true,
            },
          ],
        }}
        state={{
          rowSelection,
          columnFilters: [
            {
              id: 'address',
              value: searchQuery,
            },
          ],
        }}
        tableData={tableData}
      />

      {errors?.operators?.message && (
        <ErrorMessage>{errors?.operators?.message}</ErrorMessage>
      )}

      {/* Approval Settings - Read-only based on blueprint configuration */}
      <div className="mt-5 border border-border bg-muted/40 p-4">
        <Text variant="body1" className="text-muted-foreground mb-3">
          Approval Requirements (defined by blueprint)
        </Text>

        {isConfigLoading ? (
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Membership Model:
              </span>
              <Chip
                color={
                  blueprintConfig?.membership === MembershipModel.Fixed
                    ? 'blue'
                    : 'purple'
                }
              >
                {blueprintConfig
                  ? getMembershipLabel(blueprintConfig.membership)
                  : 'Loading...'}
              </Chip>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Min. Approvals Required:
              </span>
              <span className="text-sm font-semibold">
                {minApprovalsRequired !== null ? (
                  minApprovalsRequired
                ) : (
                  <span className="text-muted-foreground font-normal">
                    Select operators to see requirements
                  </span>
                )}
              </span>
              {minApprovalsRequired !== null &&
                (selectedOperatorsCount >= minApprovalsRequired ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-green-500/20 p-1 text-green-400">
                    <CheckLineIcon className="size-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500/20 p-1 text-red-400">
                    <Close className="size-4" />
                  </span>
                ))}
            </div>

            {selectedOperatorsCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Selected Operators:
                </span>
                <span className="text-sm font-semibold">
                  {selectedOperatorsCount}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
