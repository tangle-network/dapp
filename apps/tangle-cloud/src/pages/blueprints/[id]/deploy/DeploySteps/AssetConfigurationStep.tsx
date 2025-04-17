import { Card, Typography } from '@tangle-network/ui-components';
import { Children, FC, useMemo } from 'react';
import { AssetConfigurationStepProps } from './type';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
  setError,
  minimumNativeSecurityRequirement,
}) => {
  const assets = watch('assets');
  const securityCommitments = watch('securityCommitments');

  const selectedAssets = useMemo(() => {
    if (!assets) return [];
    return assets.map((asset) => ({
      ...asset,
      id: assertRestakeAssetId(asset.id),
    }));
  }, [assets]);

  const onChangeExposurePercent = (index: number, assetId: RestakeAssetId, value: number[]) => {
    const minExposurePercent = Number(value[0]);
    const maxExposurePercent = Number(value[1]);
    setValue(
        `securityCommitments.${index}.minExposurePercent`,
        minExposurePercent,
      );
      setValue(
        `securityCommitments.${index}.maxExposurePercent`,
        maxExposurePercent,
      );

      if (
        assetId === NATIVE_ASSET_ID &&
        minExposurePercent < minimumNativeSecurityRequirement
      ) {
        setError(`securityCommitments.${index}.minExposurePercent`, {
          message: `Minimum exposure percent must be greater than or equal to ${minimumNativeSecurityRequirement}`,
        });
      }
  };

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
              securityCommitments?.at(index)?.minExposurePercent ?? 1;
            const maxExposurePercentFormValue =
              securityCommitments?.at(index)?.maxExposurePercent ?? 100;

            return (
              <AssetRequirementFormItem
                assetId={asset.id}
                className="mb-8"
                assetMetadata={asset}
                minExposurePercent={minExposurePercentFormValue}
                maxExposurePercent={maxExposurePercentFormValue}
                onChangeExposurePercent={(value) =>
                  onChangeExposurePercent(index, asset.id, value)
                }
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
