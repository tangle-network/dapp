import { Children, FC, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Typography,
  Slider,
  Label,
} from '@tangle-network/ui-components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { shortenString } from '@tangle-network/ui-components/utils/shortenString';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import {
  useRestakeAssets,
  type RestakeAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { TrashIcon } from '@radix-ui/react-icons';
import cx from 'classnames';
import type { Address } from 'viem';
import { BaseDeployStepProps, LabelClassName } from './type';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import { RequestMode } from '../../../../../utils/validations/deployBlueprint';

const normalizeOperatorKey = (operator: string): string => {
  return operator.toLowerCase();
};

const EMPTY_OPERATORS: string[] = [];
const EMPTY_EXPOSURES: Record<string, number> = {};

export const RequestModeStep: FC<BaseDeployStepProps> = ({
  errors,
  setValue,
  watch,
  setError,
  clearErrors,
}) => {
  const requestMode = watch('requestMode') ?? 'basic';
  const operators = watch('operators') ?? EMPTY_OPERATORS;
  const operatorExposurePercents =
    watch('operatorExposurePercents') ?? EMPTY_EXPOSURES;
  const assets = watch('assets');
  const securityCommitments = watch('securityCommitments');

  const { assets: allAssetsMap } = useRestakeAssets();
  const [selectedAsset, setSelectedAsset] = useState<Address | ''>('');

  useEffect(() => {
    if (requestMode !== 'exposure') {
      return;
    }

    const nextExposurePercents: Record<string, number> = {};
    operators.forEach((operator) => {
      const key = normalizeOperatorKey(operator);
      nextExposurePercents[key] = operatorExposurePercents[key] ?? 100;
    });

    const currentKeys = Object.keys(operatorExposurePercents);
    const nextKeys = Object.keys(nextExposurePercents);
    const isSameLength = currentKeys.length === nextKeys.length;
    const isSameValues =
      isSameLength &&
      nextKeys.every(
        (key) => operatorExposurePercents[key] === nextExposurePercents[key],
      );

    if (!isSameValues) {
      setValue('operatorExposurePercents', nextExposurePercents, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [operators, operatorExposurePercents, requestMode, setValue]);

  const availableAssets = useMemo<RestakeAsset[]>(() => {
    if (!allAssetsMap) return [];
    const selectedIds = new Set(assets?.map((a) => a.id));
    return Array.from(allAssetsMap.values())
      .filter((asset) => !selectedIds.has(asset.id))
      .filter(
        (asset) => asset.metadata.name && asset.metadata.name.trim() !== '',
      );
  }, [allAssetsMap, assets]);

  const onChangeExposurePercent = (
    index: number,
    _assetId: Address,
    value: number[],
  ) => {
    const minExposurePercent = Number(value[0]);
    const maxExposurePercent = Number(value[1]);

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
          priceInUsd: null,
        },
      },
    ];
    setValue('assets', nextAssets);

    const nextSec = [
      ...(securityCommitments ?? []),
      { minExposurePercent: 1, maxExposurePercent: 100 },
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

  return (
    <Card className="p-6">
      <Typography variant="h5" className="text-mono-200 dark:text-mono-0 mb-2">
        Request Mode
      </Typography>
      <Typography variant="body2" className="text-mono-100 mb-4">
        Select which contract request variant to use when deploying.
      </Typography>

      <div className="flex flex-col gap-4">
        <div>
          <Typography variant="body3" className="mb-1">
            Mode
          </Typography>
          <Select
            value={requestMode}
            onValueChange={(value) =>
              setValue('requestMode', value as RequestMode, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-1/2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="exposure">With Exposure</SelectItem>
              <SelectItem value="security">With Security</SelectItem>
            </SelectContent>
          </Select>
          {errors?.requestMode?.message && (
            <Typography variant="body3" className="text-red-500 mt-1">
              {errors.requestMode.message}
            </Typography>
          )}
        </div>

        {requestMode === 'exposure' && (
          <div className="space-y-3">
            <div>
              <Typography
                variant="body3"
                className={cx(LabelClassName, 'mb-0.5')}
              >
                Per-Operator Exposure (%)
              </Typography>
              <Typography variant="body3" className="text-mono-100">
                Set the exact exposure percent for each selected operator.
              </Typography>
            </div>

            {operators.length === 0 ? (
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <svg
                  className="w-4 h-4 text-yellow-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <Typography
                  variant="body2"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  Select at least one operator to configure exposure
                  percentages.
                </Typography>
              </div>
            ) : (
              <div className="space-y-3">
                {operators.map((operator) => {
                  const key = normalizeOperatorKey(operator);
                  const exposurePercent = operatorExposurePercents[key] ?? 100;
                  const exposureError = (
                    errors?.operatorExposurePercents as any
                  )?.[key]?.message as string | undefined;

                  return (
                    <div
                      key={operator}
                      className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[200px]">
                        <Avatar
                          sourceVariant="address"
                          value={operator}
                          theme="ethereum"
                          size="md"
                        />
                        <div className="min-w-0">
                          <Typography
                            variant="body4"
                            className="text-mono-100 uppercase tracking-wide mb-0.5"
                          >
                            Operator
                          </Typography>
                          <Typography
                            variant="body2"
                            className={cx(LabelClassName, 'font-mono truncate')}
                          >
                            {shortenString(operator, 8)}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <Label className={cx(LabelClassName, 'mb-2 block')}>
                          Set Exposure Percentage
                        </Label>
                        <div className="space-y-2">
                          <Slider
                            hasLabel
                            min={1}
                            max={100}
                            value={[exposurePercent]}
                            onChange={(value) => {
                              const next = { ...operatorExposurePercents };
                              next[key] = value[0];
                              setValue('operatorExposurePercents', next, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                          {exposureError && (
                            <ErrorMessage className="text-sm">
                              {exposureError}
                            </ErrorMessage>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {typeof errors?.operatorExposurePercents?.message === 'string' && (
              <ErrorMessage>
                {errors.operatorExposurePercents.message}
              </ErrorMessage>
            )}
          </div>
        )}

        {requestMode === 'security' && (
          <div className="space-y-4">
            {errors?.securityCommitments?.message && (
              <ErrorMessage>{errors.securityCommitments.message}</ErrorMessage>
            )}

            <div>
              <Typography variant="body3" className="mb-1">
                Add Asset Requirements
              </Typography>
              <Select
                value={selectedAsset}
                onValueChange={(value) => {
                  addAsset(value as Address);
                  setSelectedAsset('');
                }}
              >
                <SelectTrigger className="w-1/2">
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

            <div className="space-y-4">
                {Children.toArray(
                  (assets ?? []).map((asset, index) => {
                    const minExposurePercentFormValue =
                      securityCommitments?.at(index)?.minExposurePercent ?? 1;
                    const maxExposurePercentFormValue =
                      securityCommitments?.at(index)?.maxExposurePercent ?? 100;

                    return (
                      <div className="flex flex-col lg:flex-row lg:items-start gap-3">
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
                            errors?.securityCommitments?.[index]
                              ?.minExposurePercent?.message
                          }
                          maxExposurePercentErrorMsg={
                            errors?.securityCommitments?.[index]
                              ?.maxExposurePercent?.message
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
          </div>
        )}
      </div>
    </Card>
  );
};
