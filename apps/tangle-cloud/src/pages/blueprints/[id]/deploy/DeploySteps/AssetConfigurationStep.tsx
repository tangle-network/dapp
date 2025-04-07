import { Label, Input } from '@tangle-network/ui-components';
import { Children, FC, useCallback, useMemo } from 'react';
import { AssetConfigurationStepProps } from './type';
import {
  BLUEPRINT_DEPLOY_STEPS,
  DeployBlueprintSchema,
} from '../../../../../utils/validations/deployBlueprint';
import { InstructionSideCard } from './InstructionSideCard';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import useAssetsMetadata from '@tangle-network/tangle-shared-ui/hooks/useAssetsMetadata';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { OperatorTable } from './components/OperatorTable';
import { useWatch } from 'react-hook-form';

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors: globalErrors,
  setValue,
  watch,
  control,
}) => {
  const labelClassName = 'text-mono-200 dark:text-mono-0 font-normal';

  const stepKey = BLUEPRINT_DEPLOY_STEPS.ASSET_CONFIGURATION;
  const operatorsStepKey = BLUEPRINT_DEPLOY_STEPS.OPERATOR_SELECTION;
  const values = watch(stepKey);

  const errors = globalErrors?.[stepKey];

  const approvalModel = values?.approvalModel;
  const minApprovalThreshold = values?.minApproval?.toString();

  const selectedAssets = useMemo(
    () =>
      (watch(`${operatorsStepKey}.assets`) ?? []).map((asset) => ({
        ...asset,
        id: assertRestakeAssetId(asset.id),
      })),
    [watch(`${operatorsStepKey}.assets`)],
  );

  const selectedOperators = useWatch({
    control,
    name: `${operatorsStepKey}.operators`,
    defaultValue: [],
  });

  const { result: assetsMetadata } = useAssetsMetadata(
    useMemo(() => selectedAssets.map(({ id }) => id), [selectedAssets]),
  );

  const onChangeApprovalModel = useCallback(
    (value: DeployBlueprintSchema[typeof stepKey]['approvalModel']) => {
      let changes = { ...values, approvalModel: value };
      if (value === 'Dynamic') {
        changes = {
          ...changes,
          maxApproval: selectedOperators.length,
        };
      } else {
        changes = {
          ...changes,
          maxApproval: undefined,
          minApproval: selectedOperators.length,
        };
      }

      setValue(stepKey, changes);
    },
    [stepKey, values, setValue, selectedOperators],
  );

  const onChangeMinApproval = useCallback(
    (value: DeployBlueprintSchema[typeof stepKey]['minApproval']) => {
      setValue(stepKey, {
        ...values,
        minApproval: value,
      });
    },
    [stepKey, values, setValue],
  );

  return (
    <div className="flex">
      <div>
        <InstructionSideCard
          title="Finalize Deployment"
          description="After submitting request, operators will need to approve it before the instance deployment begins."
        />
      </div>

      <div className="w-full pl-8">
        <Label className={labelClassName}>Asset Requirements:</Label>
        <div className="mt-5">
          {Children.toArray(
            selectedAssets.map(({ id }, index) => {
              const assetMetadata = assetsMetadata?.get(id);
              const minExposurePercentFormValue = watch(
                `${stepKey}.securityCommitments.${index}.minExposurePercent`,
              )?.toString();
              const maxExposurePercentFormValue = watch(
                `${stepKey}.securityCommitments.${index}.maxExposurePercent`,
              )?.toString();

              return (
                <AssetRequirementFormItem
                  index={index}
                  assetId={id}
                  className="mb-8"
                  assetMetadata={assetMetadata}
                  minExposurePercent={minExposurePercentFormValue}
                  onChangeMinExposurePercent={(value) => {
                    setValue(
                      `${stepKey}.securityCommitments.${index}.minExposurePercent`,
                      Number(value),
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      },
                    );
                  }}
                  minExposurePercentErrorMsg={
                    errors?.securityCommitments?.[index]?.minExposurePercent
                      ?.message
                  }
                  maxExposurePercent={maxExposurePercentFormValue}
                  onChangeMaxExposurePercent={(value) => {
                    setValue(
                      `${stepKey}.securityCommitments.${index}.maxExposurePercent`,
                      Number(value),
                      {
                        shouldValidate: true,
                        shouldDirty: true,
                      },
                    );
                  }}
                  maxExposurePercentErrorMsg={
                    errors?.securityCommitments?.[index]?.maxExposurePercent
                      ?.message
                  }
                />
              );
            }),
          )}
        </div>

        <div className="mt-5 flex gap-4">
          <div className="w-1/2">
            <Label className={labelClassName}>Approval Model:</Label>
            <Select value={approvalModel} onValueChange={onChangeApprovalModel}>
              <SelectTrigger>
                <SelectValue
                  className="text-[16px] leading-[30px]"
                  placeholder="Select an approval model"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fixed">
                  Require all operators to approve
                </SelectItem>
                <SelectItem value="Dynamic">
                  Minimum required approvals
                </SelectItem>
              </SelectContent>
            </Select>
            {globalErrors?.[stepKey]?.approvalModel?.message && (
              <ErrorMessage>
                {globalErrors?.[stepKey]?.approvalModel?.message}
              </ErrorMessage>
            )}
          </div>

          {approvalModel === 'Dynamic' && (
            <div className="w-1/2">
              <Label className={labelClassName}>Approval Threshold:</Label>
              <Input
                value={minApprovalThreshold}
                onChange={(nextValue) => onChangeMinApproval(Number(nextValue))}
                isControlled
                type="number"
                id="approval-threshold"
              />
              {globalErrors?.[stepKey]?.minApproval?.message && (
                <ErrorMessage>
                  {globalErrors?.[stepKey]?.minApproval?.message}
                </ErrorMessage>
              )}
            </div>
          )}
        </div>

        <div className="mt-5">
          <Label className={labelClassName}>Selected Operators:</Label>
          <OperatorTable
            advanceFilter={(row) => {
              return watch(`${operatorsStepKey}.operators`).includes(
                row.address,
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
