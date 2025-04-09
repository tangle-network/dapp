import { Card, Typography } from '@tangle-network/ui-components';
import { Children, FC, useMemo } from 'react';
import { AssetConfigurationStepProps } from './type';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const values = watch();

  const selectedAssets = useMemo(() => {
    if (!values.assets) return [];
    return values.assets
      .filter((asset) => !!asset.id)
      .map((asset) => ({
        ...asset,
        id: assertRestakeAssetId(asset.id),
      }));
  }, [values.assets]);

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Asset Requirements
      </Typography>
      {errors?.securityCommitments?.message && (
        <ErrorMessage>{errors?.securityCommitments?.message}</ErrorMessage>
      )}
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <div className="mt-5">
        {Children.toArray(
          selectedAssets.map((asset, index) => {
            const minExposurePercentFormValue =
              values.securityCommitments?.at(index)?.minExposurePercent ?? 0;
            const maxExposurePercentFormValue =
              values.securityCommitments?.at(index)?.maxExposurePercent ?? 100;

            return (
              <AssetRequirementFormItem
                assetId={asset.id}
                className="mb-8"
                assetMetadata={asset}
                minExposurePercent={minExposurePercentFormValue}
                maxExposurePercent={maxExposurePercentFormValue}
                onChangeExposurePercent={(value) => {
                  setValue(
                    `securityCommitments.${index}.minExposurePercent`,
                    Number(value[0]),
                  );
                  setValue(
                    `securityCommitments.${index}.maxExposurePercent`,
                    Number(value[1]),
                  );
                }}
                minExposurePercentErrorMsg={
                  errors?.securityCommitments?.[index]?.minExposurePercent
                    ?.message
                }
                maxExposurePercentErrorMsg={
                  errors?.securityCommitments?.[index]?.maxExposurePercent
                    ?.message
                }
              />
            );
          }),
        )}
      </div>
    </Card>
  );
};
