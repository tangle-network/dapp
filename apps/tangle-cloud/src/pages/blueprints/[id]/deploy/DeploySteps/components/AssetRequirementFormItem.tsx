import { Text } from '../../../../../../components/sandbox/SandboxUi';
import { FC } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import cx from 'classnames';
import { AssetSchema } from '../../../../../../utils/validations/deployBlueprint';
import { LabelClassName } from '../type';
import type { Address } from 'viem';

const shortenString = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

type BaseAssetRequirementFormItemProps = {
  assetId?: Address;
  assetMetadata?: AssetSchema | null;
  minExposurePercent?: number;
  maxExposurePercent?: number;
  className?: string;
};

type ViewOnlyAssetRequirementFormItemProps = BaseAssetRequirementFormItemProps;

type AssetRequirementFormItemProps = BaseAssetRequirementFormItemProps & {
  onChangeExposurePercent: (value: number[]) => void;
  minExposurePercentErrorMsg?: string;
  maxExposurePercentErrorMsg?: string;
};

export const AssetRequirementFormItem: FC<
  AssetRequirementFormItemProps | ViewOnlyAssetRequirementFormItemProps
> = (props) => {
  const {
    assetId,
    minExposurePercent,
    maxExposurePercent,
    assetMetadata,
    className,
  } = props;

  const isViewOnly = !(
    ('onChangeExposurePercent' satisfies
      | keyof AssetRequirementFormItemProps
      | ViewOnlyAssetRequirementFormItemProps) in props
  );

  return (
    <div
      className={cx(
        'flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-mono-20/50 dark:bg-mono-190/50 rounded-lg w-full',
        className,
      )}
    >
      <div className="flex items-center gap-3 flex-shrink-0 lg:w-[200px]">
        <LsTokenIcon
          name={assetMetadata?.metadata.symbol ?? 'TNT'}
          hasRainbowBorder
          size="lg"
        />
        <div className="min-w-0">
          <Text variant="h5" className={cx(LabelClassName, 'truncate')}>
            {assetMetadata?.metadata.name ?? 'Unknown'}
          </Text>
          <Text variant="body3" className={cx(LabelClassName, 'truncate')}>
            {assetMetadata?.metadata.symbol ??
              (assetId ? shortenString(assetId, 4) : 'Unknown')}
          </Text>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <label className={cx(LabelClassName, 'mb-2 block')}>
          {isViewOnly ? 'Exposure Percentage' : 'Set Exposure Percentage'}
        </label>
        {isViewOnly ? (
          <Text variant="body1" className={LabelClassName}>
            {maxExposurePercent ?? '0'}%
          </Text>
        ) : (
          <div className="space-y-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-mono-120 dark:text-mono-100">
                  <span>Minimum</span>
                  <span className="font-mono text-mono-200 dark:text-mono-0">
                    {minExposurePercent || 1}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={minExposurePercent || 1}
                  onChange={(event) => {
                    if (!isViewOnly) {
                      props.onChangeExposurePercent([
                        Number(event.currentTarget.value),
                        maxExposurePercent || 100,
                      ]);
                    }
                  }}
                  className="h-2 w-full cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-mono-120 dark:text-mono-100">
                  <span>Maximum</span>
                  <span className="font-mono text-mono-200 dark:text-mono-0">
                    {maxExposurePercent || 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={maxExposurePercent || 100}
                  onChange={(event) => {
                    if (!isViewOnly) {
                      props.onChangeExposurePercent([
                        minExposurePercent || 1,
                        Number(event.currentTarget.value),
                      ]);
                    }
                  }}
                  className="h-2 w-full cursor-pointer accent-primary"
                />
              </div>
            </div>
            {!isViewOnly &&
              (props.minExposurePercentErrorMsg ||
                props.maxExposurePercentErrorMsg) && (
                <div className="space-y-1">
                  {props.minExposurePercentErrorMsg && (
                    <ErrorMessage className="text-sm">
                      {props.minExposurePercentErrorMsg}
                    </ErrorMessage>
                  )}
                  {props.maxExposurePercentErrorMsg && (
                    <ErrorMessage className="text-sm">
                      {props.maxExposurePercentErrorMsg}
                    </ErrorMessage>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
