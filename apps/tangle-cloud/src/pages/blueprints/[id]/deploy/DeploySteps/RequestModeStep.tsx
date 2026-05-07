import { Children, FC, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '../../../../../components/sandbox/SandboxUi';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import {
  useStakingAssets,
  type StakingAsset,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { TrashIcon } from '@radix-ui/react-icons';
import cx from 'classnames';
import type { Address } from 'viem';
import { BaseDeployStepProps, LabelClassName } from './type';
import { AssetRequirementFormItem } from './components/AssetRequirementFormItem';
import { RequestMode } from '../../../../../utils/validations/deployBlueprint';

const shortenString = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

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

  const { assets: allAssetsMap } = useStakingAssets();
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

  const availableAssets = useMemo<StakingAsset[]>(() => {
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
      <Text variant="h5" className="mb-2">
        Request Mode
      </Text>
      <Text variant="body2" className="text-muted-foreground mb-4">
        Select which contract request variant to use when deploying.
      </Text>

      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-4">
          <div className="w-1/2">
            <Text variant="body3" className="mb-1">
              Mode
            </Text>
            <Select
              value={requestMode}
              onValueChange={(value: string) =>
                setValue('requestMode', value as RequestMode, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="exposure">With Exposure</SelectItem>
                <SelectItem value="security">With Security</SelectItem>
              </SelectContent>
            </Select>
            {errors?.requestMode?.message && (
              <Text variant="body3" className="text-destructive mt-1">
                {errors.requestMode.message}
              </Text>
            )}
          </div>

          {requestMode === 'security' && (
            <div className="flex-1">
              <Text variant="body3" className="mb-1">
                Add Asset Requirements
              </Text>
              <Select
                value={selectedAsset}
                onValueChange={(value: string) => {
                  addAsset(value as Address);
                  setSelectedAsset('');
                }}
              >
                <SelectTrigger className="w-full">
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
                            <Text variant="body1">{name}</Text>
                          </div>
                        </SelectItem>
                      );
                    }),
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {requestMode === 'exposure' && (
          <div className="space-y-3">
            <div>
              <Text variant="body3" className={cx(LabelClassName, 'mb-0.5')}>
                Per-Operator Exposure (%)
              </Text>
              <Text variant="body3" className="text-muted-foreground">
                Set the exact exposure percent for each selected operator.
              </Text>
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
                <Text
                  variant="body2"
                  className="text-yellow-600 dark:text-yellow-400"
                >
                  Select at least one operator to configure exposure
                  percentages.
                </Text>
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
                      className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-muted/40 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[200px]">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-gradient-to-br from-primary/25 to-accent/25 font-mono text-xs text-foreground">
                          {operator.slice(2, 4).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <Text
                            variant="body4"
                            className="text-muted-foreground uppercase tracking-wide mb-0.5"
                          >
                            Operator
                          </Text>
                          <Text
                            variant="body2"
                            className={cx(LabelClassName, 'font-mono truncate')}
                          >
                            {shortenString(operator, 8)}
                          </Text>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <label className={cx(LabelClassName, 'mb-2 block')}>
                          Set Exposure Percentage
                        </label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              className="h-2 w-full cursor-pointer accent-primary"
                              min={1}
                              max={100}
                              value={exposurePercent}
                              onChange={(event) => {
                                const next = { ...operatorExposurePercents };
                                next[key] = Number(event.currentTarget.value);
                                setValue('operatorExposurePercents', next, {
                                  shouldDirty: true,
                                  shouldTouch: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                            <span className="w-12 text-right font-mono text-sm text-foreground">
                              {exposurePercent}%
                            </span>
                          </div>
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
