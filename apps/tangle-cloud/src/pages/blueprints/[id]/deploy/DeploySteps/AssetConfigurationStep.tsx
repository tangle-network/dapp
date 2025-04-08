import { Card, Typography } from '@tangle-network/ui-components';
import { Children, FC, useCallback, useMemo } from 'react';
import { AssetConfigurationStepProps } from './type';
import {
  Select,
  SelectCheckboxItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import useAssetsMetadata from '@tangle-network/tangle-shared-ui/hooks/useAssetsMetadata';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';

const MAX_ASSET_TO_SHOW = 3;

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
}) => {
  const values = watch();

  const { assets: assets_ } = useRestakeAssets();

  const assets = useMemo(() => {
    if (!assets_) return [];
    return Array.from(assets_.values());
  }, [assets_]);

  const selectedAssets = useMemo(() => {
    if (!values.assets) return [];
    return values.assets
      .filter((asset) => !!asset.id)
      .map((asset) => ({
        ...asset,
        id: assertRestakeAssetId(asset.id),
      }));
  }, [values.assets]);

  const { result: assetsMetadata } = useAssetsMetadata(
    useMemo(() => {
      if (!assets) return [];
      return Array.from(assets.values()).map(({ id }) => id);
    }, [assets]),
  );

  const onSelectAsset = useCallback(
    (asset: RestakeAsset, isChecked: boolean) => {
      // Create a new array instead of mutating the existing one
      const newSelectedAssets = isChecked
        ? [...selectedAssets, asset]
        : selectedAssets.filter(
            (selectedAsset) => selectedAsset.id !== asset.id,
          );

      setValue(`assets`, newSelectedAssets);
    },
    [selectedAssets, setValue],
  );

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Asset Requirements
      </Typography>
      <hr className="border-mono-80 dark:border-mono-160 mb-6" />

      <Select>
        <SelectTrigger className="w-fit">
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
                `Select delegated assets`
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
                  <LsTokenIcon name={asset.metadata.name ?? 'TNT'} size="md" />
                  <Typography variant="body1">
                    {asset.metadata.name ?? 'TNT'}
                  </Typography>
                </div>
              </SelectCheckboxItem>
            )),
          )}
        </SelectContent>
      </Select>
      {errors?.assets?.message && (
        <ErrorMessage className="mt-1">{errors.assets.message}</ErrorMessage>
      )}

      <div className="mt-5">
        {Children.toArray(
          selectedAssets.map(({ id }, index) => {
            const assetMetadata = assetsMetadata?.get(id);
            const minExposurePercentFormValue = watch(
              `securityCommitments.${index}.minExposurePercent`,
            )?.toString();
            const maxExposurePercentFormValue = watch(
              `securityCommitments.${index}.maxExposurePercent`,
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
                    `securityCommitments.${index}.minExposurePercent`,
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
                    `securityCommitments.${index}.maxExposurePercent`,
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
    </Card>
  );
};
