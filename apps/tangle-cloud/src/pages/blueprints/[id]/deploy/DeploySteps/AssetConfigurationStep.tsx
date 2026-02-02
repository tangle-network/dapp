import { Card, Typography, Button } from '@tangle-network/ui-components';
import { Children, FC, useMemo, useState } from 'react';
import { AssetConfigurationStepProps } from './type';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import ErrorMessage from '../../../../../components/ErrorMessage';
import {
  useRestakeAssets,
  type RestakeAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { TrashIcon } from '@radix-ui/react-icons';
import type { Address } from 'viem';

export const AssetConfigurationStep: FC<AssetConfigurationStepProps> = ({
  errors,
  setValue,
  watch,
  setError,
  clearErrors,
  minimumNativeSecurityRequirement: _minimumNativeSecurityRequirement,
}) => {
  const assets = watch('assets');
  const { assets: allAssetsMap } = useRestakeAssets();
  const securityCommitments = watch('securityCommitments');

  const selectedAssets = useMemo(() => {
    if (!assets) return [];
    return assets;
  }, [assets]);

  const onChangeExposurePercent = (
    index: number,
    _assetId: Address,
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

    // Exposure percent must be at least 1% (contract rejects 0)
    if (minExposurePercent < 1) {
      errorMsg = 'Minimum exposure percent must be at least 1%';
    } else if (maxExposurePercent < 1) {
      errorMsg = 'Maximum exposure percent must be at least 1%';
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

  const [selectedAsset, setSelectedAsset] = useState<Address | ''>('');

  const addAsset = (assetId: Address) => {
    if (!allAssetsMap) return;
    const asset = allAssetsMap.get(assetId);
    if (!asset) return;

    const nextAssets = [
      ...(assets ?? []),
      {
        id: asset.id,
        metadata: {
          name: asset.metadata.name,
          symbol: asset.metadata.symbol,
          decimals: asset.metadata.decimals,
          priceInUsd: null, // TODO: Add price feed
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

  const availableAssets = useMemo<RestakeAsset[]>(() => {
    if (!allAssetsMap) return [];
    const selectedIds = new Set(assets?.map((a) => a.id));
    return Array.from(allAssetsMap.values())
      .filter((asset) => !selectedIds.has(asset.id))
      .filter(
        (asset) => asset.metadata.name && asset.metadata.name.trim() !== '',
      );
  }, [allAssetsMap, assets]);

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
              addAsset(value as Address);
              setSelectedAsset(''); // reset to placeholder
            }}
          >
            <SelectTrigger className="w-64 h-10">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {Children.toArray(
                availableAssets.map((asset) => {
                  const name = asset.metadata.name || 'Unknown';
                  const symbol = asset.metadata.symbol || 'TNT';
                  return (
                    <SelectItem value={asset.id} id={asset.id}>
                      <div className="flex items-center gap-2">
                        <LsTokenIcon name={symbol} size="md" />
                        <Typography variant="body1">{name}</Typography>
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
