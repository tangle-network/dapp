import { Card, Typography, Button } from '@tangle-network/ui-components';
import { Children, FC, useMemo, useState } from 'react';
import { AssetConfigurationStepProps } from './type';
import assertRestakeAssetId from '@tangle-network/tangle-shared-ui/utils/assertRestakeAssetId';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { NATIVE_ASSET_ID } from '@tangle-network/tangle-shared-ui/constants/restaking';
import useAssets from '@tangle-network/tangle-shared-ui/hooks/useAssets';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { TrashIcon } from '@radix-ui/react-icons';

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
  setError,
  clearErrors,
  minimumNativeSecurityRequirement,
}) => {
  const assets = watch('assets');
  const { result: allAssets } = useAssets();
  const securityCommitments = watch('securityCommitments');

  const selectedAssets = useMemo(() => {
    if (!assets) return [];
    return assets.map((asset) => ({
      ...asset,
      id: assertRestakeAssetId(asset.id),
    }));
  }, [assets]);

  const onChangeExposurePercent = (
    index: number,
    assetId: RestakeAssetId,
    value: number[],
  ) => {
    const minExposurePercent = Number(value[0]);
    const maxExposurePercent = Number(value[1]);

    // always clear previous errors before re-validating
    clearErrors(`securityCommitments.${index}.minExposurePercent`);
    clearErrors(`securityCommitments.${index}.maxExposurePercent`);
    clearErrors('securityCommitments');

    setValue(
      `securityCommitments.${index}.minExposurePercent`,
      minExposurePercent,
      { shouldValidate: false },
    );
    setValue(
      `securityCommitments.${index}.maxExposurePercent`,
      maxExposurePercent,
      { shouldValidate: false },
    );

    let errorMsg: string | null = null;

    if (
      assetId === NATIVE_ASSET_ID &&
      minExposurePercent < minimumNativeSecurityRequirement
    ) {
      errorMsg = `Minimum exposure percent must be greater than or equal to ${minimumNativeSecurityRequirement}`;
    } else if (minExposurePercent > maxExposurePercent) {
      errorMsg = 'Minimum exposure percent cannot exceed maximum';
    }

    if (errorMsg) {
      setError(`securityCommitments.${index}.minExposurePercent`, {
        message: errorMsg,
      });
    } else {
      clearErrors(`securityCommitments.${index}.minExposurePercent`);
      clearErrors(`securityCommitments.${index}`);
      clearErrors('securityCommitments');
    }
  };

  const [selectedAsset, setSelectedAsset] = useState<RestakeAssetId | ''>('');

  const addAsset = (assetId: RestakeAssetId) => {
    if (!allAssets) return;
    const asset = allAssets.get(assetId);
    if (!asset) return;

    const nextAssets = [
      ...(assets ?? []),
      {
        id: asset.id,
        metadata: {
          ...asset.metadata,
          deposit: asset.metadata.deposit ?? '',
          isFrozen: asset.metadata.isFrozen ?? false,
        },
      },
    ];
    setValue('assets', nextAssets);

    // ensure corresponding security commitment
    const nextSec = [
      ...(securityCommitments ?? []),
      {
        minExposurePercent: 1,
        maxExposurePercent: 100,
      },
    ];
    setValue('securityCommitments', nextSec);
  };

  const removeAsset = (index: number) => {
    const nextAssets = assets?.filter((_, idx) => idx !== index) ?? [];
    setValue('assets', nextAssets);

    const nextSec =
      securityCommitments?.filter((_, idx) => idx !== index) ?? [];
    setValue('securityCommitments', nextSec);
  };

  const availableAssets = useMemo(() => {
    if (!allAssets) return [] as RestakeAssetId[];
    const selectedIds = new Set(assets?.map((a) => a.id));
    return Array.from(allAssets.values())
      .filter((asset) => !selectedIds.has(asset.id))
      .filter(
        (asset) => asset.metadata.name && asset.metadata.name.trim() !== '',
      )
      .map((a) => a.id);
  }, [allAssets, assets]);

  return (
    <Card className="p-6 space-y-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-4">
        Asset Requirements
      </Typography>
      {errors?.securityCommitments?.message && (
        <ErrorMessage>{errors?.securityCommitments?.message}</ErrorMessage>
      )}

      {/* asset selector */}
      <div>
        <Typography variant="body1" className="mb-2">
          Add Asset
        </Typography>
        <div className="flex gap-4 items-center">
          <Select
            value={selectedAsset}
            onValueChange={(value) => {
              const id = assertRestakeAssetId(value);
              addAsset(id);
              setSelectedAsset(''); // reset to placeholder
            }}
          >
            <SelectTrigger className="w-64 h-10">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {Children.toArray(
                availableAssets.map((id) => {
                  const meta = allAssets?.get(id);
                  const name = meta?.metadata.name || 'TNT';
                  return (
                    <SelectItem value={id} id={id}>
                      <div className="flex items-center gap-2">
                        <LsTokenIcon
                          name={name}
                          size="md"
                        />
                        <Typography variant="body1">
                          {name}
                        </Typography>
                      </div>
                    </SelectItem>
                  );
                }),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {Children.toArray(
          selectedAssets.map((asset, index) => {
            const minExposurePercentFormValue =
              securityCommitments?.at(index)?.minExposurePercent ?? 1;
            const maxExposurePercentFormValue =
              securityCommitments?.at(index)?.maxExposurePercent ?? 100;

            return (
              <div className="flex flex-col lg:flex-row lg:items-start gap-3 mb-6">
                <AssetRequirementFormItem
                  assetId={asset.id}
                  className="flex-1"
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
                <Button
                  variant="utility"
                  onClick={() => removeAsset(index)}
                  className="self-start lg:self-center lg:mt-2 flex-shrink-0"
                  size="sm"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            );
          }),
        )}
      </div>
    </Card>
  );
};
