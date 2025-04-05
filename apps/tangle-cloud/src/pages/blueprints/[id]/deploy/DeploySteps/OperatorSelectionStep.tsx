import {
  Typography,
  assertSubstrateAddress,
  Input,
} from '@tangle-network/ui-components';
import { FC, useEffect, useMemo, useState, Children, useCallback } from 'react';
import { SelectOperatorsStepProps, OperatorSelectionTable } from './type';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import {
  RowSelectionState,
} from '@tanstack/react-table';
import ErrorMessage from '../../../../../components/ErrorMessage';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import safeFormatUnits from '@tangle-network/tangle-shared-ui/utils/safeFormatUnits';
import useOperatorsServices from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorsServices';
import delegationsToVaultTokens from '@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import {
  Select,
  SelectContent,
  SelectCheckboxItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { Search } from '@tangle-network/icons';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';
import { OperatorTable } from './components/OperatorTable';

const MAX_ASSET_TO_SHOW = 3;
const stepKey = BLUEPRINT_DEPLOY_STEPS[1];

export const SelectOperatorsStep: FC<SelectOperatorsStepProps> = ({
  errors: globalErrors,
  setValue,
  watch,
}) => {

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    watch(`${stepKey}.operators`)?.reduce((acc, operator) => {
      acc[operator] = true;
      return acc;
    }, {} as RowSelectionState) || {},
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { operatorMap } = useRestakeOperatorMap();
  const operatorAddresses = useMemo(
    () =>
      Object.keys(operatorMap).map((address) =>
        assertSubstrateAddress(address),
      ),
    [operatorMap],
  );

  const { result: operatorServicesMap } =
    useOperatorsServices(operatorAddresses);
  const { result: identities } = useIdentities(operatorAddresses);
  const { assets } = useRestakeAssets();

  const operators = useMemo<OperatorSelectionTable[]>(() => {
    return Object.entries(operatorMap).map(
      ([addressString, { delegations, restakersCount }]) => {
        const address = assertSubstrateAddress(addressString);

        return {
          address,
          identityName: identities.get(address)?.name ?? undefined,
          restakersCount,
          vaultTokensInUsd: delegations.reduce((acc, curr) => {
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
            const currPrice =
              Number(parsed.value) * (asset.metadata.priceInUsd ?? 0);
            return acc + currPrice;
          }, 0),
          vaultTokens:
            assets === null
              ? []
              : delegationsToVaultTokens(delegations, assets),
          instanceCount: operatorServicesMap.get(address)?.length ?? 0,
          // TODO: using graphql with im online pallet to get uptime of operator
          uptime: Math.round(Math.random() * 100),
        };
      },
    );
  }, [operatorServicesMap, operatorMap, identities, assets]);

  const errors = globalErrors?.[stepKey];

  const selectedAssets = watch(`${stepKey}.assets`) ?? [];

  const advanceFilter = useCallback((operator: OperatorSelectionTable) => {
    if (selectedAssets.length === 0) return true;

    const selectedSymbols = new Set(
      selectedAssets.map((asset) => asset.metadata.symbol),
    );

    return !!operator.vaultTokens?.some((vaultToken) =>
      selectedSymbols.has(vaultToken.symbol),
    );
  }, [selectedAssets]);

  /**
   * @dev set the operators to the form value when the rowSelection changes
   */
  useEffect(() => {
    setValue(`${stepKey}.operators`, Object.keys(rowSelection));
  }, [rowSelection]);

  const onSelectAsset = useCallback(
    (asset: RestakeAsset, isChecked: boolean) => {
      // Create a new array instead of mutating the existing one
      const newSelectedAssets = isChecked
        ? [...selectedAssets, asset]
        : selectedAssets.filter(
            (selectedAsset) => selectedAsset.id !== asset.id,
          );

      if (!isChecked) {
        // Filter operators that have the selected assets
        const selectedOperators = operators
          .filter((operator) =>
            operator.vaultTokens?.some((vaultToken) =>
              newSelectedAssets.some(
                (selectedAsset) =>
                  selectedAsset.metadata.symbol === vaultToken.symbol,
              ),
            ),
          )
          .map((operator) => operator.address);

        // Create a single object with all operators set to false
        const newRowSelection = selectedOperators.reduce((acc, operator) => {
          acc[operator] = false;
          return acc;
        }, {} as RowSelectionState);

        setRowSelection(newRowSelection);
      }

      setValue(`${stepKey}.assets`, newSelectedAssets);
    },
    [selectedAssets, operators, setValue, stepKey],
  );

  return (
    <div className="w-full">
      <Typography variant="h4">Choose Operators</Typography>

      <Typography
        variant="body1"
        fw="normal"
        className="mt-4 mb-6 !text-mono-100"
      >
        After submitting request, operators will need to approve it before the
        instance deployment begins.
      </Typography>

      <div className="flex justify-between mb-3">
        <div className="w-1/4">
          <Select>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedAssets.length > 0 ? (
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
                        {selectedAssets.length > MAX_ASSET_TO_SHOW && (
                          <Typography variant="body1" className="ml-1">
                            ..
                          </Typography>
                        )}
                      </div>
                      <Typography variant="body1">
                        {selectedAssets.length} asset(s) selected
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
                Array.from(assets?.values() ?? []).map((asset) => (
                  <SelectCheckboxItem
                    onChange={(e) => onSelectAsset(asset, e.target.checked)}
                    id={asset.id}
                    isChecked={selectedAssets.some(
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
                )),
              )}
            </SelectContent>
          </Select>

          <ErrorMessage>{globalErrors?.[stepKey]?.assets?.message}</ErrorMessage>
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
          state = {{
            rowSelection,
            columnFilters: [
              {
                id: 'address',
                value: searchQuery,
              },
            ],
          }}
          advanceFilter={advanceFilter}
      />

      <ErrorMessage>{errors?.operators?.message}</ErrorMessage>
    </div>
  );
};
