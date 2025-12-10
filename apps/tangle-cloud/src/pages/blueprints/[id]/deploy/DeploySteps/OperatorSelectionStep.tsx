import {
  Typography,
  Input,
  Card,
  Label,
} from '@tangle-network/ui-components';
import { FC, useEffect, useMemo, useState, Children } from 'react';
import {
  SelectOperatorsStepProps,
  OperatorSelectionTable,
  ApprovalModelLabel,
  LabelClassName,
} from './type';
import { RowSelectionState } from '@tanstack/react-table';
import ErrorMessage from '../../../../../components/ErrorMessage';
import safeFormatUnits from '@tangle-network/tangle-shared-ui/utils/safeFormatUnits';
import {
  Select,
  SelectContent,
  SelectCheckboxItem,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@tangle-network/ui-components/components/select';
import { Search } from '@tangle-network/icons';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { OperatorTable } from './components/OperatorTable';
import { DeployBlueprintSchema } from '../../../../../utils/validations/deployBlueprint';
import {
  useOperatorMap,
  useRestakingAssetMap,
  type Operator,
  type RestakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import lodash from 'lodash';
import { Address, formatUnits } from 'viem';

const MAX_ASSET_TO_SHOW = 3;

export const SelectOperatorsStep: FC<SelectOperatorsStepProps> = ({
  errors,
  setValue,
  watch,
  minimumNativeSecurityRequirement,
  blueprint,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    watch(`operators`)?.reduce((acc, operator) => {
      acc[operator] = true;
      return acc;
    }, {} as RowSelectionState) || {},
  );

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch operators from GraphQL indexer
  const { data: operatorMap, isLoading: isLoadingOperators } = useOperatorMap();

  // Fetch restaking assets from GraphQL indexer
  const { data: assetMap } = useRestakingAssetMap();

  // Get operators registered for this blueprint
  const operators = useMemo<OperatorSelectionTable[]>(() => {
    if (!operatorMap) return [];

    // Filter operators registered for this blueprint if blueprint is provided
    const filteredOperators = blueprint?.blueprintId
      ? Array.from(operatorMap.values()).filter((op) =>
          op.blueprints?.some((b) => b.blueprintId === blueprint.blueprintId),
        )
      : Array.from(operatorMap.values());

    return filteredOperators.map((operator) => {
      // Calculate total stake value
      const totalStakeValue = operator.delegations?.reduce(
        (acc, delegation) => {
          const asset = assetMap?.get(delegation.token.toLowerCase() as Address);
          if (!asset) return acc;

          const formatted = formatUnits(delegation.amount, asset.decimals);
          const usdValue = parseFloat(formatted) * (asset.priceUsd ?? 0);
          return acc + usdValue;
        },
        0,
      ) ?? 0;

      // Get vault tokens from delegations
      const vaultTokens = operator.delegations?.map((delegation) => {
        const asset = assetMap?.get(delegation.token.toLowerCase() as Address);
        return {
          symbol: asset?.symbol ?? 'Unknown',
          amount: delegation.amount,
          decimals: asset?.decimals ?? 18,
        };
      }) ?? [];

      return {
        address: operator.address,
        identityName: operator.metadata?.name,
        restakersCount: operator.delegatorCount ?? 0,
        vaultTokensInUsd: totalStakeValue,
        selfBondedAmount: operator.stake ?? 0n,
        vaultTokens,
        instanceCount: operator.serviceCount ?? 0,
        uptime: 100, // TODO: Get from metrics
        pricing: {
          cpu: 0,
          mem: 0,
          storage: 0,
        },
      };
    });
  }, [operatorMap, assetMap, blueprint]);

  const selectedAssets = watch('assets');
  const approvalModel = watch('approvalModel');
  const minApproval = watch('minApproval');

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
    setValue(`operators`, Object.keys(rowSelection));
  }, [rowSelection, setValue]);

  const onSelectAsset = (asset: RestakingAsset, isChecked: boolean) => {
    const selectedAssets_ = Array.from(selectedAssets ?? []);
    const newSelectedAssets = isChecked
      ? [
          ...selectedAssets_,
          {
            id: asset.token,
            metadata: {
              symbol: asset.symbol,
              name: asset.name,
              decimals: asset.decimals,
              priceInUsd: asset.priceUsd,
            },
          },
        ]
      : selectedAssets.filter((selectedAsset) => selectedAsset.id !== asset.token);

    setValue(`assets`, newSelectedAssets);

    // Initialize security commitments
    const securityCommitments = newSelectedAssets.map((selectedAsset) => {
      return {
        asset: selectedAsset.id,
        minExposurePercent: 0,
        maxExposurePercent: 100,
      };
    });
    setValue(`securityCommitments`, securityCommitments);
  };

  const onChangeApprovalModel = (
    value: DeployBlueprintSchema['approvalModel'],
  ) => {
    let newMaxApproval: number | undefined;
    let newMinApproval: number = minApproval;

    if (value === 'Dynamic') {
      newMaxApproval = Object.keys(rowSelection).length;
    } else {
      newMaxApproval = undefined;
      newMinApproval = Object.keys(rowSelection).length;
    }

    setValue(`approvalModel`, value);
    setValue(`maxApproval`, newMaxApproval);
    setValue(`minApproval`, newMinApproval);
  };

  const onChangeMinApproval = (value: DeployBlueprintSchema['minApproval']) => {
    setValue(`minApproval`, value);
  };

  // Get all available assets for filtering
  const allAssets = useMemo(() => {
    if (!assetMap) return [];
    return Array.from(assetMap.values());
  }, [assetMap]);

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Select Operators
      </Typography>

      <div className="flex justify-between mb-3">
        <div className="w-1/4">
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
                                  name={asset.metadata?.name ?? 'TNT'}
                                  size="md"
                                />
                              </div>
                            )),
                        )}
                        {selectedAssets?.length > MAX_ASSET_TO_SHOW && (
                          <Typography variant="body1" className="ml-1">
                            ..
                          </Typography>
                        )}
                      </div>
                      <Typography variant="body1">
                        {selectedAssets?.length} asset(s) selected
                      </Typography>
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
                  return (
                    <SelectCheckboxItem
                      onChange={(e) => onSelectAsset(asset, e.target.checked)}
                      id={asset.token}
                      isChecked={selectedAssets?.some(
                        (selectedAsset) => selectedAsset.id === asset.token,
                      )}
                      spacingClassName="ml-0"
                    >
                      <div className="flex items-center gap-2">
                        <LsTokenIcon
                          name={asset.name ?? 'TNT'}
                          size="md"
                        />
                        <Typography variant="body1">
                          {asset.name ?? 'TNT'}
                        </Typography>
                      </div>
                    </SelectCheckboxItem>
                  );
                }),
              )}
            </SelectContent>
          </Select>

          {errors?.assets?.message && (
            <ErrorMessage>{errors?.assets?.message}</ErrorMessage>
          )}
        </div>

        <div className="w-1/4">
          <Input
            debounceTime={300}
            isControlled
            leftIcon={<Search />}
            id="deploy-operator-selection-search"
            placeholder="Search operator"
            size="md"
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

      <div className="mt-5 flex gap-4">
        <div className="space-y-2 w-1/2">
          <Label className={LabelClassName}>Approval Model:</Label>
          <Select value={approvalModel} onValueChange={onChangeApprovalModel}>
            <SelectTrigger className="h-10">
              <SelectValue
                className="text-[16px] leading-[30px]"
                placeholder="Select an approval model"
              />
            </SelectTrigger>
            <SelectContent>
              {Children.toArray(
                Object.entries(ApprovalModelLabel).map(([key, label]) => (
                  <SelectItem value={key}>{label}</SelectItem>
                )),
              )}
            </SelectContent>
          </Select>
          {errors?.approvalModel?.message && (
            <ErrorMessage>{errors?.approvalModel?.message}</ErrorMessage>
          )}
        </div>

        {approvalModel === 'Dynamic' && (
          <div className="space-y-2 w-1/2">
            <Label className={LabelClassName}>Approval Threshold:</Label>
            <Input
              value={minApproval?.toString()}
              inputClassName="h-10"
              onChange={(nextValue) => onChangeMinApproval(Number(nextValue))}
              isControlled
              type="number"
              id="approval-threshold"
            />
            {errors?.minApproval?.message && (
              <ErrorMessage>{errors?.minApproval?.message}</ErrorMessage>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
