import { Typography, Input, Card, Label } from '@tangle-network/ui-components';
import { FC, useEffect, useState, Children, useCallback } from 'react';
import {
  SelectOperatorsStepProps,
  OperatorSelectionTable,
  ApprovalModelLabel,
} from './type';
import { RowSelectionState } from '@tanstack/react-table';
import ErrorMessage from '../../../../../components/ErrorMessage';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@tangle-network/ui-components/components/select';
import { Search } from '@tangle-network/icons';
import { OperatorTable } from './components/OperatorTable';
import { DeployBlueprintSchema } from '../../../../../utils/validations/deployBlueprint';

const labelClassName = 'text-mono-200 dark:text-mono-0 font-medium';

export const SelectOperatorsStep: FC<SelectOperatorsStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const values = watch();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    values.operators?.reduce((acc, operator) => {
      acc[operator] = true;
      return acc;
    }, {} as RowSelectionState) || {},
  );
  const [searchQuery, setSearchQuery] = useState('');

  const selectedAssets = values.assets ?? [];

  const advanceFilter = useCallback(
    (operator: OperatorSelectionTable) => {
      if (selectedAssets.length === 0) return true;

      const selectedSymbols = new Set(
        selectedAssets.map((asset) => asset.metadata?.symbol),
      );

      return !!operator.vaultTokens?.some((vaultToken) =>
        selectedSymbols.has(vaultToken.symbol),
      );
    },
    [selectedAssets],
  );

  /**
   * @dev set the operators to the form value when the rowSelection changes
   */
  useEffect(() => {
    setValue(`operators`, Object.keys(rowSelection));
  }, [rowSelection]);

  const onChangeApprovalModel = useCallback(
    (value: DeployBlueprintSchema['approvalModel']) => {
      let changes = { ...values, approvalModel: value };
      if (value === 'Dynamic') {
        changes = {
          ...changes,
          maxApproval: Object.keys(rowSelection).length,
        };
      } else {
        changes = {
          ...changes,
          maxApproval: undefined,
          minApproval: Object.keys(rowSelection).length,
        };
      }

      setValue(`approvalModel`, changes.approvalModel);
      setValue(`maxApproval`, changes.maxApproval);
      setValue(`minApproval`, changes.minApproval);
    },
    [values, setValue],
  );

  const onChangeMinApproval = useCallback(
    (value: DeployBlueprintSchema['minApproval']) => {
      setValue(`minApproval`, value);
    },
    [values, setValue],
  );

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Approval Settings
      </Typography>
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <div className="flex justify-between mb-3">
        <div className="w-1/3">
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
        advanceFilter={advanceFilter}
      />
      {errors?.operators?.message && (
        <ErrorMessage>{errors?.operators?.message}</ErrorMessage>
      )}

      <div className="mt-5 flex gap-4">
        <div className="w-1/2">
          <Label className={labelClassName}>Approval Model:</Label>
          <Select
            value={values.approvalModel}
            onValueChange={onChangeApprovalModel}
          >
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
          <ErrorMessage>{errors?.approvalModel?.message}</ErrorMessage>
        </div>

        {values.approvalModel === 'Dynamic' && (
          <div className="w-1/2">
            <Label className={labelClassName}>Approval Threshold:</Label>
            <Input
              value={values.minApproval?.toString()}
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
