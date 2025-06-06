import {
  Typography,
  assertSubstrateAddress,
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
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { RowSelectionState } from '@tanstack/react-table';
import ErrorMessage from '../../../../../components/ErrorMessage';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import safeFormatUnits from '@tangle-network/tangle-shared-ui/utils/safeFormatUnits';
import useOperatorsServices from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorsServices';
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
  OperatorDelegatorBond,
  RestakeAsset,
} from '@tangle-network/tangle-shared-ui/types/restake';
import delegationsToVaultTokens from '@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import useBlueprintRegisteredOperator from '@tangle-network/tangle-shared-ui/data/blueprints/useBlueprintRegisteredOperator';
import { getOperatorPricing } from '../../../../../utils';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import lodash from 'lodash';

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
  const { assets } = useRestakeAssets();

  const blueprintId = blueprint?.id;

  const { result: registeredOperators_ } =
    useBlueprintRegisteredOperator(blueprintId);

  const registeredOperators = useMemo(() => {
    return new Map(
      registeredOperators_.map((operator) => [
        operator.operatorAccount,
        operator,
      ]),
    );
  }, [registeredOperators_]);

  const operatorAddresses = useMemo(
    () =>
      registeredOperators_.map((operator) =>
        assertSubstrateAddress(operator.operatorAccount),
      ),
    [registeredOperators_],
  );

  const { result: operatorServicesMap } =
    useOperatorsServices(operatorAddresses);

  const { result: identities } = useIdentities(operatorAddresses);
  const { result: restakeOperatorMap } = useRestakeOperatorMap();

  const operators = useMemo<OperatorSelectionTable[]>(() => {
    const filteredRestakeOperators = Array.from(
      restakeOperatorMap.entries(),
    ).filter(([address]) => registeredOperators.has(address));

    return filteredRestakeOperators.map(
      ([addressString, { delegations, restakersCount }]) => {
        const address = assertSubstrateAddress(addressString);
        const operatorPreferences = registeredOperators.get(address);

        // This case should not happen because we filter the operators in the restake operator map.
        if (!operatorPreferences) {
          throw new Error('Operator not found');
        }

        const registeredData = operatorPreferences.preferences;

        return {
          address,
          identityName: identities.get(address)?.name ?? undefined,
          restakersCount,
          vaultTokensInUsd: delegations.reduce(
            (acc: number, curr: OperatorDelegatorBond) => {
              const asset = assets?.get(curr.assetId);

              if (!asset) {
                return acc;
              }

              const parsed = safeFormatUnits(
                curr.amount,
                asset.metadata.decimals,
              );

              if (parsed.success === false) {
                return acc;
              }

              const currentPrice =
                Number(parsed.value) * (asset.metadata.priceInUsd ?? 0);

              return acc + currentPrice;
            },
            0,
          ),
          vaultTokens:
            assets === null
              ? []
              : delegationsToVaultTokens(delegations, assets),
          instanceCount: operatorServicesMap.get(address)?.length ?? 0,
          // TODO: Using GraphQL with im online pallet to get uptime of operator.
          uptime: Math.round(Math.random() * 100),
          pricing: getOperatorPricing(registeredData.priceTargets),
        };
      },
    );
  }, [
    restakeOperatorMap,
    registeredOperators,
    identities,
    assets,
    operatorServicesMap,
  ]);

  const selectedAssets = watch('assets');
  const approvalModel = watch('approvalModel');
  const minApproval = watch('minApproval');

  const tableData = useMemo(() => {
    if (!Array.isArray(selectedAssets) || selectedAssets.length === 0)
      return operators;

    const selectedSymbols = new Set(
      selectedAssets.map((asset) => asset.metadata.symbol),
    );

    return operators.filter((operator) => {
      return operator.vaultTokens?.some((vaultToken) =>
        selectedSymbols.has(vaultToken.symbol),
      );
    });
  }, [operators, selectedAssets]);

  // set the operators to the form value when the rowSelection changes
  useEffect(() => {
    setValue(`operators`, Object.keys(rowSelection));
  }, [rowSelection, setValue]);

  const onSelectAsset = (asset: RestakeAsset, isChecked: boolean) => {
    const selectedAssets_ = Array.from(selectedAssets ?? []);
    const newSelectedAssets = isChecked
      ? [
          ...selectedAssets_,
          {
            id: asset.id,
            metadata: lodash.pick(asset.metadata, [
              'symbol',
              'assetId',
              'vaultId',
              'priceInUsd',
              'name',
              'decimals',
              'details',
              'status',
              'deposit',
              'isFrozen',
            ]),
          },
        ]
      : selectedAssets.filter((selectedAsset) => selectedAsset.id !== asset.id);

    setValue(`assets`, newSelectedAssets);

    // initialize security commitments
    const securityCommitments = newSelectedAssets.map((asset) => {
      const securityCommitment = {
        asset: asset.id,
        minExposurePercent: 0,
        maxExposurePercent: 100,
      };
      if (asset.id === NATIVE_ASSET_ID) {
        securityCommitment.minExposurePercent =
          minimumNativeSecurityRequirement;
      }
      return securityCommitment;
    });
    setValue(`securityCommitments`, securityCommitments);

    // Filter operators that are selected but don't have delegated assets in the selected assets
    const selectedOperators = tableData
      .filter((operator) => rowSelection[operator.address]) // selected operators
      .filter((operator) =>
        operator.vaultTokens?.every((vaultToken) =>
          newSelectedAssets.every(
            (selectedAsset) =>
              selectedAsset.metadata.symbol !== vaultToken.symbol,
          ),
        ),
      )
      .map((operator) => operator.address);

    const newRowSelection = selectedOperators.reduce((acc, operator) => {
      acc[operator] = false;
      return acc;
    }, {} as RowSelectionState);

    setRowSelection((prev) => ({ ...prev, ...newRowSelection }));
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

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Select Operators
      </Typography>
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <div className="flex justify-between mb-3">
        <div className="w-1/4">
          <Select>
            <SelectTrigger>
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
                                  name={asset.metadata.name ?? 'TNT'}
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
                Array.from(assets?.values() ?? []).map((asset) => {
                  return (
                    <SelectCheckboxItem
                      onChange={(e) => onSelectAsset(asset, e.target.checked)}
                      id={asset.id}
                      isChecked={selectedAssets?.some(
                        (selectedAsset) => selectedAsset.id === asset.id,
                      )}
                      spacingClassName="ml-0"
                    >
                      <div className="flex items-center gap-2">
                        <LsTokenIcon
                          name={asset.metadata.name ?? 'TNT'}
                          size="md"
                        />
                        <Typography variant="body1">
                          {asset.metadata.name ?? 'TNT'}
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
            inputClassName="py-1"
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
        <div className="w-1/2">
          <Label className={LabelClassName}>Approval Model:</Label>
          <Select value={approvalModel} onValueChange={onChangeApprovalModel}>
            <SelectTrigger>
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
          <div className="w-1/2">
            <Label className={LabelClassName}>Approval Threshold:</Label>
            <Input
              value={minApproval?.toString()}
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
