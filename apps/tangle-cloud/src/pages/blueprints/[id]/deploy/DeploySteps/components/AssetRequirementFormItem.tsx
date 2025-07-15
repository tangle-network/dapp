import { RestakeAssetId } from '@tangle-network/tangle-shared-ui/types';
import { Typography, Label, Slider } from '@tangle-network/ui-components';
import { FC } from 'react';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import ErrorMessage from '../../../../../../components/ErrorMessage';
import cx from 'classnames';
import { AssetSchema } from '../../../../../../utils/validations/deployBlueprint';
import { LabelClassName } from '../type';

type BaseAssetRequirementFormItemProps = {
  assetId?: RestakeAssetId;
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
        'flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg w-full',
        className,
      )}
    >
      <div className="flex items-center gap-3 flex-shrink-0">
        <LsTokenIcon
          name={assetMetadata?.metadata.name ?? 'TNT'}
          hasRainbowBorder
          size="lg"
        />
        <div>
          <Typography variant="h5" className={LabelClassName}>
            {assetMetadata?.metadata.name ?? 'TNT'}
          </Typography>
          <Typography variant="body3" className={LabelClassName}>
            Asset ID: {assetId}
          </Typography>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <Label className={cx(LabelClassName, 'mb-2 block')}>
          {isViewOnly ? 'Exposure Percentage' : 'Set Exposure Percentage'}
        </Label>
        {isViewOnly ? (
          <Typography variant="body1" className={LabelClassName}>
            {maxExposurePercent ?? '0'}%
          </Typography>
        ) : (
          <div className="space-y-2">
            <Slider
              hasLabel
              value={[minExposurePercent || 0, maxExposurePercent || 100]}
              onChange={(value) => {
                if (!isViewOnly) {
                  props.onChangeExposurePercent(value);
                }
              }}
              className="w-full"
            />
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
