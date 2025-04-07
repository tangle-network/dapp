import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Input, Typography, Label } from '@tangle-network/ui-components';
import { FC } from 'react';
import { PrimitiveAssetMetadata } from '@tangle-network/tangle-shared-ui/types/restake';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import cx from 'classnames';

type BaseAssetRequirementFormItemProps = {
  index: number;
  assetId?: RestakeAssetId;
  assetMetadata?: PrimitiveAssetMetadata | null;
  minExposurePercent?: string;
  maxExposurePercent?: string;
  className?: string;
};

type ViewOnlyAssetRequirementFormItemProps = BaseAssetRequirementFormItemProps;

type AssetRequirementFormItemProps = BaseAssetRequirementFormItemProps & {
  onChangeMinExposurePercent: (value: string) => void;
  onChangeMaxExposurePercent: (value: string) => void;
  minExposurePercentErrorMsg?: string;
  maxExposurePercentErrorMsg?: string;
};

export const AssetRequirementFormItem: FC<
  AssetRequirementFormItemProps | ViewOnlyAssetRequirementFormItemProps
> = (props) => {
  const {
    index,
    assetId,
    minExposurePercent,
    maxExposurePercent,
    assetMetadata,
    className,
  } = props;

  const isViewOnly = !('onChangeMinExposurePercent' in props);

  return (
    <div
      className={cx(
        'flex flex-col gap-6 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <LsTokenIcon
          name={assetMetadata?.name ?? 'TNT'}
          hasRainbowBorder
          size="lg"
        />
        <div>
          <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
            {assetMetadata?.name ?? 'TNT'}
          </Typography>
          <Typography
            variant="body3"
            className="text-mono-120 dark:text-mono-100"
          >
            Asset ID: {assetId}
          </Typography>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-mono-200 dark:text-mono-0">
            {isViewOnly ? 'Minimum Exposure' : 'Set Minimum Exposure'}
          </Label>
          {isViewOnly ? (
            <Typography
              variant="body1"
              className="text-mono-200 dark:text-mono-0"
            >
              {minExposurePercent ?? '0'}%
            </Typography>
          ) : (
            <>
              <Input
                id={`securityCommitment.${index}.minExposurePercent`}
                isControlled
                rightIcon={<>%</>}
                value={minExposurePercent ?? ''}
                inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
                placeholder="Enter minimum exposure"
                onChange={(value: string) => {
                  if (!isViewOnly) {
                    props.onChangeMinExposurePercent(value);
                  }
                }}
                type="number"
                autoComplete="off"
                min={0}
                max={maxExposurePercent || 100}
              />
              {!isViewOnly && (
                <ErrorMessage className="mt-1">
                  {props.minExposurePercentErrorMsg}
                </ErrorMessage>
              )}
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-mono-200 dark:text-mono-0">
            {isViewOnly ? 'Maximum Exposure' : 'Set Maximum Exposure'}
          </Label>
          {isViewOnly ? (
            <Typography
              variant="body1"
              className="text-mono-200 dark:text-mono-0"
            >
              {maxExposurePercent ?? '0'}%
            </Typography>
          ) : (
            <>
              <Input
                id={`securityCommitment.${index}.maxExposurePercent`}
                isControlled
                rightIcon={<>%</>}
                value={maxExposurePercent ?? ''}
                inputClassName="placeholder:text-mono-80 dark:placeholder:text-mono-120 h-10"
                placeholder="Enter maximum exposure"
                onChange={(value: string) => {
                  if (!isViewOnly) {
                    props.onChangeMaxExposurePercent(value);
                  }
                }}
                type="number"
                autoComplete="off"
                min={minExposurePercent || 0}
                max={100}
              />
              {!isViewOnly && (
                <ErrorMessage className="mt-1">
                  {props.maxExposurePercentErrorMsg}
                </ErrorMessage>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
